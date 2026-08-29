import hashlib
import os
import re
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file
PORT = int(os.getenv("PORT", "8080"))

# Supabase Credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")  # Use your service_role key or anon key

app = FastAPI(title="Madhuban Traders API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fallback_store: Dict[str, Dict[str, Any]] = {
    "workers": {},
    "bills": {},
    "submissions": {},
    "billing_settings": {},
}

# Initialize Supabase Client with Fallback
db: Optional[Client] = None
try:
    print(f"Attempting to connect to Supabase at {SUPABASE_URL}... {'with service role key' if SUPABASE_SERVICE_ROLE_KEY else 'without service role key'}")
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        db = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        # Health check to ensure connection works
        db.table("workers").select("id").limit(1).execute()
        print("Supabase connected successfully.")
    else:
        print("Supabase credentials missing. Using in-memory fallback.")
except Exception as exc:  # pragma: no cover
    db = None
    print(f"Supabase connection failed. Using in-memory fallback. Details: {exc}")


class WorkerLoginRequest(BaseModel):
    username: str
    password: str


class BillPayload(BaseModel):
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerAddress: Optional[str] = None
    customerGstin: Optional[str] = None
    customerStateCode: Optional[str] = None
    customerStateName: Optional[str] = None
    supplierName: Optional[str] = "MADHUBAN TRADERS"
    supplierAddress: Optional[str] = "Sindhora, Varanasi, Uttar Pradesh 221208"
    supplierGstin: Optional[str] = "09AAAAA0000A1Z5"
    supplierFssai: Optional[str] = "10023051000123"
    supplierStateCode: Optional[str] = "09"
    supplierStateName: Optional[str] = "Uttar Pradesh"
    invoiceNumber: Optional[str] = None
    isB2B: Optional[bool] = True
    items: List[Dict[str, Any]] = Field(default_factory=list)
    totalAmount: Optional[float] = 0
    discount: Optional[float] = 0
    arrears: Optional[float] = 0
    paymentMethod: Optional[str] = "cash"


class BillingSettingsPayload(BaseModel):
    supplierName: Optional[str] = "MADHUBAN TRADERS"
    supplierAddress: Optional[str] = "Sindhora, Varanasi, Uttar Pradesh 221208"
    supplierGstin: Optional[str] = "09AAAAA0000A1Z5"
    supplierFssai: Optional[str] = "10023051000123"
    supplierStateCode: Optional[str] = "09"
    supplierStateName: Optional[str] = "Uttar Pradesh"


# --- Manager Product CRUD (New feature) ---
# Added for shop-manager product catalog management: create, list, update, delete.
class ProductPayload(BaseModel):
    name: Optional[str] = None
    name_hi: Optional[str] = None
    price: float = 0
    category: Optional[str] = "General"
    description: Optional[str] = ""
    description_hi: Optional[str] = ""
    manufacturer: Optional[str] = "Madhuban Traders"
    origin: Optional[str] = "India"
    ingredients: List[str] = Field(default_factory=list)
    healthBenefits: List[str] = Field(default_factory=list)
    healthBenefits_hi: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    hsnCode: Optional[str] = None
    gstRate: Optional[float] = 5
    variants: List[Dict[str, Any]] = Field(default_factory=list)
    stock: Optional[int] = 0
    image: Optional[str] = ""
    images: List[str] = Field(default_factory=list)


class SubmissionPayload(BaseModel):
    type: Optional[str] = "inquiry"
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    page: Optional[str] = None
    customer: Optional[Dict[str, Any]] = None
    cart: Optional[List[Dict[str, Any]]] = None
    subtotal: Optional[float] = 0
    receivedAt: Optional[str] = None


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def ensure_seed_worker() -> None:
    if db is not None:
        try:
            res = db.table("workers").select("*").eq("id", "w1").execute()
            if not res.data:
                db.table("workers").insert(
                    {
                        "id": "w1",
                        "username": "shop1",
                        "passwordHash": hash_password("shop123"),
                        "name": "Shop Manager 1",
                        "role": "manager",
                        "createdAt": utc_now_iso(),
                    }
                ).execute()
            return
        except Exception as e:
            print(f"Error seeding worker in Supabase: {e}")

    if "shop1" not in fallback_store["workers"]:
        fallback_store["workers"]["shop1"] = {
            "id": "w1",
            "username": "shop1",
            "passwordHash": hash_password("shop123"),
            "name": "Shop Manager 1",
            "role": "manager",
            "createdAt": utc_now_iso(),
        }


ensure_seed_worker()


def normalize_doc(doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(payload)
    normalized.setdefault("id", doc_id)
    normalized.setdefault("createdAt", utc_now_iso())
    normalized.setdefault("receivedAt", normalized["createdAt"])
    return normalized


def camel_to_snake(name: str) -> str:
    name = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", name)
    name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    return name.lower()


def to_db_record(record: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(record, dict):
        return record
    converted: Dict[str, Any] = {}
    for key, value in record.items():
        converted[camel_to_snake(str(key))] = value
    return converted


def from_db_record(record: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(record, dict):
        return record
    converted: Dict[str, Any] = {}
    for key, value in record.items():
        snake_key = str(key)
        api_key = snake_key
        if "_" in snake_key:
            parts = snake_key.split("_")
            api_key = parts[0] + "".join(part[:1].upper() + part[1:] for part in parts[1:])
        converted[api_key] = value
    return converted


def default_billing_settings() -> Dict[str, Any]:
    return {
        "supplierName": "MADHUBAN TRADERS",
        "supplierAddress": "Sindhora, Varanasi, Uttar Pradesh 221208",
        "supplierGstin": "09AAAAA0000A1Z5",
        "supplierFssai": "10023051000123",
        "supplierStateCode": "09",
        "supplierStateName": "Uttar Pradesh",
    }


def default_products() -> List[Dict[str, Any]]:
    return [
        {
            "id": "prod-1",
            "name": "Mustard Oil (Kacchi Ghani)",
            "name_hi": "सरसों का तेल (कच्ची घानी)",
            "price": 190,
            "category": "Oils",
            "description": "Authentic Kacchi Ghani Mustard Oil with rich natural aroma.",
            "description_hi": "प्राकृतिक खुशबू वाला असली कच्ची घानी सरसों का तेल।",
            "manufacturer": "Madhuban Oils Co.",
            "origin": "Rajasthan, India",
            "ingredients": ["Cold-pressed mustard oil"],
            "healthBenefits": ["Rich in MUFA", "Supports heart health"],
            "healthBenefits_hi": ["MUFA से भरपूर", "हृदय स्वास्थ्य के लिए मददगार"],
            "certifications": ["FSSAI"],
            "hsnCode": "1514",
            "gstRate": 5,
            "variants": [{"id": "v1a", "label": "1 L", "price": 195}],
            "stock": 25,
            "image": "",
            "images": [],
        },
        {
            "id": "prod-2",
            "name": "Groundnut Oil",
            "name_hi": "मूंगफली का तेल",
            "price": 70,
            "category": "Oils",
            "description": "Pure groundnut oil ideal for frying and cooking.",
            "description_hi": "तलने और पकाने के लिए उपयुक्त शुद्ध मूंगफली का तेल।",
            "manufacturer": "Madhuban Oils Co.",
            "origin": "Gujarat, India",
            "ingredients": ["Cold-pressed groundnut oil"],
            "healthBenefits": ["High smoke point", "Vitamin E enriched"],
            "healthBenefits_hi": ["उच्च स्मोक पॉइंट", "विटामिन ई समृद्ध"],
            "certifications": ["FSSAI"],
            "hsnCode": "1508",
            "gstRate": 5,
            "variants": [{"id": "v2a", "label": "500 ml", "price": 150}],
            "stock": 18,
            "image": "",
            "images": [],
        },
        {
            "id": "prod-3",
            "name": "Turmeric Powder",
            "name_hi": "हल्दी पाउडर",
            "price": 90,
            "category": "Spices",
            "description": "Premium turmeric powder with natural color and aroma.",
            "description_hi": "प्राकृतिक रंग और खुशबू वाला प्रीमियम हल्दी पाउडर।",
            "manufacturer": "Madhuban Traders",
            "origin": "India",
            "ingredients": ["Turmeric"],
            "healthBenefits": ["Anti-inflammatory", "Good for immunity"],
            "healthBenefits_hi": ["एंटी-इंफ्लेमेटरी", "प्रतिरक्षा के लिए उत्तम"],
            "certifications": ["FSSAI"],
            "hsnCode": "0910",
            "gstRate": 5,
            "variants": [{"id": "v3a", "label": "500 g", "price": 95}],
            "stock": 40,
            "image": "",
            "images": [],
        },
    ]


GSTIN_PATTERN = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
FSSAI_PATTERN = re.compile(r"^[0-9]{14}$")
INVOICE_NUMBER_PATTERN = re.compile(r"^[A-Z0-9/-]{1,16}$")
ALLOWED_LIQUID_OIL_PACKAGES = {"50ml", "100ml", "200ml", "500ml", "1l", "2l", "3l", "5l", "15l"}


def validate_gstin(value: Optional[str], field_name: str = "GSTIN") -> Optional[str]:
    if value is None or str(value).strip() == "":
        return None
    cleaned = str(value).strip().upper()
    if not GSTIN_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format. Expected 15-character GSTIN.")
    return cleaned


def validate_fssai(value: Optional[str], field_name: str = "FSSAI") -> Optional[str]:
    if value is None or str(value).strip() == "":
        return None
    cleaned = str(value).strip()
    if not FSSAI_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format. Expected 14-digit FSSAI number.")
    return cleaned


def validate_invoice_number(value: Optional[str]) -> Optional[str]:
    if value is None or str(value).strip() == "":
        return None
    cleaned = str(value).strip().upper()
    if not INVOICE_NUMBER_PATTERN.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Invalid invoice number. Use 1-16 characters: A-Z, 0-9, / or -.")
    return cleaned


def validate_hsn_code(value: Optional[str], minimum_digits: int = 4) -> Optional[str]:
    if value is None or str(value).strip() == "":
        return None
    cleaned = str(value).strip()
    if not cleaned.isdigit() or len(cleaned) < minimum_digits:
        raise HTTPException(status_code=400, detail=f"Invalid HSN code. Minimum {minimum_digits} digits required.")
    return cleaned


def validate_b2c_high_value(data: Dict[str, Any]) -> None:
    customer_name = str(data.get("customerName") or "").strip()
    customer_address = str(data.get("customerAddress") or "").strip()
    customer_state = str(data.get("customerStateCode") or "").strip()
    gross_value = float(data.get("totalAmount") or 0)
    is_b2b = bool(data.get("isB2B", True))

    if not is_b2b and gross_value > 50000:
        if not customer_name or not customer_address or not customer_state:
            raise HTTPException(
                status_code=400,
                detail="B2C invoice above ₹50,000 requires customer name, delivery address, and state code.",
            )


def validate_liquid_oil_package(item: Dict[str, Any]) -> None:
    name = str(item.get("productName") or item.get("name") or "").lower()
    category = str(item.get("category") or "").lower()
    if "oil" not in name and "oil" not in category and "mustard" not in name and "groundnut" not in name:
        return

    quantity = item.get("quantity")
    if quantity is None:
        return

    qty_text = str(quantity).strip().lower()
    if qty_text and qty_text not in ALLOWED_LIQUID_OIL_PACKAGES:
        if qty_text.endswith("l") or qty_text.endswith("ml"):
            return


def get_billing_settings() -> Dict[str, Any]:
    settings = fallback_store.get("billing_settings", {}).get("default")
    if settings is not None:
        return settings

    settings = default_billing_settings()
    fallback_store.setdefault("billing_settings", {})["default"] = settings
    return settings


def ensure_seed_products() -> None:
    if list_documents("products"):
        return

    for product in default_products():
        save_document("products", str(product["id"]), product)


def list_documents(collection_name: str) -> List[Dict[str, Any]]:
    if db is not None:
        try:
            res = db.table(collection_name).select("*").execute()
            return [from_db_record(row) for row in (res.data or [])]
        except Exception as exc:  # pragma: no cover
            print(f"Falling back for collection {collection_name}: {exc}")

    return list(fallback_store.get(collection_name, {}).values())


def get_document(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
    if db is not None:
        try:
            res = db.table(collection_name).select("*").eq("id", str(doc_id)).execute()
            if res.data:
                return from_db_record(res.data[0])
            return None
        except Exception as exc:  # pragma: no cover
            print(f"Falling back for get_document {collection_name}/{doc_id}: {exc}")

    return fallback_store.get(collection_name, {}).get(str(doc_id))


def save_document(collection_name: str, doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = normalize_doc(doc_id, payload)

    if db is not None:
        try:
            db.table(collection_name).upsert(to_db_record(normalized)).execute()
            return normalized
        except Exception as exc:  # pragma: no cover
            print(f"Falling back for save_document {collection_name}/{doc_id}: {exc}")

    fallback_store.setdefault(collection_name, {})[str(doc_id)] = normalized
    return normalized


def delete_document(collection_name: str, doc_id: str) -> bool:
    if db is not None:
        res = db.table(collection_name).delete().eq("id", str(doc_id)).execute()
        return len(res.data) > 0

    if str(doc_id) in fallback_store.get(collection_name, {}):
        del fallback_store[collection_name][str(doc_id)]
        return True
    return False


def calculate_gst_breakdown(items: List[Dict[str, Any]], supplier_state_code: Optional[str], customer_state_code: Optional[str], discount: float = 0, arrears: float = 0) -> Dict[str, float]:
    supplier_code = str(supplier_state_code or "09").strip() or "09"
    buyer_code = str(customer_state_code or supplier_code).strip() or supplier_code
    is_inter_state = supplier_code != buyer_code

    taxable_value = 0.0
    cgst = 0.0
    sgst = 0.0
    igst = 0.0

    for item in items or []:
        quantity = float(item.get("quantity") or item.get("qty") or 0)
        unit_price = float(item.get("price") or 0)
        line_discount = float(item.get("discount") or 0)
        gst_rate = float(item.get("gstRate") or item.get("gst_rate") or 5)
        line_taxable = max(0.0, (quantity * unit_price) - line_discount)
        taxable_value += line_taxable

        tax_amount = (line_taxable * gst_rate) / 100.0
        if is_inter_state:
            igst += tax_amount
        else:
            cgst += tax_amount / 2.0
            sgst += tax_amount / 2.0

    total_before_tax = taxable_value + cgst + sgst + igst
    net_amount = max(0.0, total_before_tax - float(discount or 0) + float(arrears or 0))

    return {
        "taxableValue": round(taxable_value, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "igst": round(igst, 2),
        "taxAmount": round(cgst + sgst + igst, 2),
        "netAmount": round(net_amount, 2),
    }


def generate_token() -> str:
    return secrets.token_hex(32)


def verify_token(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ", 1)[1]

    if db is not None:
        res = db.table("workers").select("*").eq("token", token).execute()
        if res.data:
            return from_db_record(res.data[0])
        raise HTTPException(status_code=401, detail="Invalid token")

    for worker in fallback_store["workers"].values():
        if worker.get("token") == token:
            return worker
    raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": utc_now_iso(), "database": "supabase" if db else "in-memory"}


@app.post("/api/auth/login")
def login(payload: WorkerLoginRequest):
    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail="Username and password required")

    if db is not None:
        res = db.table("workers").select("*").eq("username", str(payload.username)).execute()
        worker = from_db_record(res.data[0]) if res.data else None
    else:
        worker = fallback_store["workers"].get(str(payload.username))

    if not worker or worker.get("passwordHash") != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = generate_token()
    worker["token"] = token
    worker["lastLogin"] = utc_now_iso()

    if db is not None:
        db.table("workers").upsert(to_db_record(worker)).execute()
    else:
        fallback_store["workers"][str(payload.username)] = worker

    return {
        "success": True,
        "token": token,
        "worker": {
            "id": worker.get("id"),
            "username": worker.get("username"),
            "name": worker.get("name"),
            "role": worker.get("role"),
        },
    }


@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(default=None)):
    worker = verify_token(authorization)
    worker["token"] = None
    if db is not None:
        db.table("workers").upsert(to_db_record(worker)).execute()
    else:
        fallback_store["workers"][str(worker.get("username"))] = worker
    return {"success": True, "message": "Logged out successfully"}


@app.get("/api/auth/verify")
def verify(authorization: Optional[str] = Header(default=None)):
    worker = verify_token(authorization)
    return {
        "success": True,
        "worker": {
            "id": worker.get("id"),
            "username": worker.get("username"),
            "name": worker.get("name"),
            "role": worker.get("role"),
        },
    }


@app.post("/api/submissions")
def create_submission(payload: SubmissionPayload):
    payload_data = payload.model_dump(exclude_none=True)
    if not payload_data.get("name") and not payload_data.get("customer"):
        raise HTTPException(status_code=400, detail="Submission requires a name or customer")

    submission_id = str(uuid.uuid4())
    submission = normalize_doc(submission_id, payload_data)
    submission["id"] = submission_id
    submission["source"] = "frontend"
    if submission.get("type") == "checkout" and submission.get("customer"):
        submission["customer"] = submission["customer"]

    save_document("submissions", submission_id, submission)
    return submission


# --- Manager Product CRUD API endpoints (New feature) ---
# UI endpoints used by shop-manager product management:
# GET /api/products, GET /api/products/{id}, POST /api/products, PUT /api/products/{id}, DELETE /api/products/{id}
@app.get("/api/products")
def list_products():
    ensure_seed_products()
    return {"success": True, "products": list_documents("products")}


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    item = get_document("products", product_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "product": item}


@app.post("/api/products")
def create_product(payload: ProductPayload, authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    product_id = str(uuid.uuid4())
    product = {**payload.model_dump(exclude_none=True), "id": product_id}
    product["createdAt"] = utc_now_iso()
    saved = save_document("products", product_id, product)
    return {"success": True, "product": saved}


@app.put("/api/products/{product_id}")
def update_product(product_id: str, payload: ProductPayload, authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    existing = get_document("products", product_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = {**existing, **payload.model_dump(exclude_none=True), "updatedAt": utc_now_iso()}
    saved = save_document("products", product_id, updated)
    return {"success": True, "product": saved}


@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    deleted = delete_document("products", product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "message": "Product deleted"}


@app.get("/api/submissions")
def list_submissions():
    return list_documents("submissions")


@app.get("/api/submissions/{submission_id}")
def get_submission(submission_id: str):
    item = get_document("submissions", submission_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return item


@app.put("/api/submissions/{submission_id}")
def update_submission(submission_id: str, payload: SubmissionPayload):
    existing = get_document("submissions", submission_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    merged = {**existing, **payload.model_dump(exclude_none=True)}
    merged["updatedAt"] = utc_now_iso()
    updated = save_document("submissions", submission_id, merged)
    return updated


@app.delete("/api/submissions/{submission_id}")
def delete_submission(submission_id: str):
    deleted = delete_document("submissions", submission_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True, "message": "Submission deleted"}


@app.get("/api/billing-settings")
def get_billing_settings_route(authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    return {"success": True, "settings": get_billing_settings()}


@app.put("/api/billing-settings")
def update_billing_settings(payload: BillingSettingsPayload, authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    cleaned_payload = payload.model_dump(exclude_none=True)
    cleaned_payload["supplierGstin"] = validate_gstin(cleaned_payload.get("supplierGstin"), "supplier GSTIN")
    cleaned_payload["supplierFssai"] = validate_fssai(cleaned_payload.get("supplierFssai"), "supplier FSSAI")

    settings = {**get_billing_settings(), **cleaned_payload}
    fallback_store.setdefault("billing_settings", {})["default"] = settings
    save_document("billing_settings", "default", settings)
    return {"success": True, "settings": settings}


@app.post("/api/bills")
def create_bill(payload: BillPayload, authorization: Optional[str] = Header(default=None)):
    worker = verify_token(authorization)
    if not payload.items:
        raise HTTPException(status_code=400, detail="Bill must contain at least one item")

    payload_supplier_gstin = validate_gstin(payload.supplierGstin, "supplier GSTIN")
    payload_supplier_fssai = validate_fssai(payload.supplierFssai, "supplier FSSAI")
    payload_customer_gstin = validate_gstin(payload.customerGstin, "customer GSTIN") if payload.customerGstin else None
    payload_invoice_number = validate_invoice_number(payload.invoiceNumber)

    for item in payload.items:
        item_hsn = item.get("hsnCode") or item.get("hsn_code")
        validate_hsn_code(item_hsn, 4)
        validate_liquid_oil_package(item)

    settings = get_billing_settings()
    existing = list_documents("bills")
    next_id = max((int(item.get("id", 0)) for item in existing), default=999) + 1

    supplier_state_code = payload.supplierStateCode or settings.get("supplierStateCode") or "09"
    customer_state_code = payload.customerStateCode or supplier_state_code
    subtotal = sum(float(item.get("price") or 0) * float(item.get("quantity") or item.get("qty") or 0) for item in payload.items)
    final_total = float(payload.totalAmount or 0) if payload.totalAmount is not None else subtotal
    gst_breakdown = calculate_gst_breakdown(
        payload.items,
        supplier_state_code,
        customer_state_code,
        payload.discount or 0,
        payload.arrears or 0,
    )

    validate_b2c_high_value({
        "customerName": payload.customerName,
        "customerAddress": payload.customerAddress,
        "customerStateCode": customer_state_code,
        "totalAmount": final_total,
        "isB2B": payload.isB2B,
    })

    total_amount = payload.totalAmount if payload.totalAmount is not None else gst_breakdown["netAmount"]

    bill = {
        "id": str(next_id),
        "billNumber": payload_invoice_number or f"BILL-{next_id}",
        "customerName": payload.customerName or "Walk-in Customer",
        "customerPhone": payload.customerPhone or "",
        "customerAddress": payload.customerAddress or "",
        "customerGstin": payload_customer_gstin or "",
        "customerStateCode": customer_state_code,
        "customerStateName": payload.customerStateName or settings.get("supplierStateName"),
        "supplierName": payload.supplierName or settings.get("supplierName"),
        "supplierAddress": payload.supplierAddress or settings.get("supplierAddress"),
        "supplierGstin": payload_supplier_gstin or settings.get("supplierGstin"),
        "supplierFssai": payload_supplier_fssai or settings.get("supplierFssai"),
        "supplierStateCode": supplier_state_code,
        "supplierStateName": payload.supplierStateName or settings.get("supplierStateName"),
        "invoiceNumber": payload_invoice_number or f"BILL-{next_id}",
        "isB2B": payload.isB2B if payload.isB2B is not None else True,
        "items": payload.items,
        "subtotal": round(subtotal, 2),
        "taxableValue": gst_breakdown["taxableValue"],
        "cgst": gst_breakdown["cgst"],
        "sgst": gst_breakdown["sgst"],
        "igst": gst_breakdown["igst"],
        "taxAmount": gst_breakdown["taxAmount"],
        "totalAmount": round(float(total_amount), 2),
        "discount": payload.discount or 0,
        "arrears": payload.arrears or 0,
        "paymentMethod": payload.paymentMethod or "cash",
        "createdBy": worker.get("id"),
        "createdByName": worker.get("name"),
        "createdAt": utc_now_iso(),
        "status": "completed",
    }
    saved_bill = save_document("bills", str(next_id), bill)
    return {"success": True, "bill": saved_bill}


@app.get("/api/bills")
def list_bills(limit: int = Query(50), offset: int = Query(0), authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)

    all_bills = sorted(list_documents("bills"), key=lambda item: item.get("createdAt", ""), reverse=True)
    paged = all_bills[offset : offset + limit]
    return {"success": True, "bills": paged, "total": len(all_bills)}


@app.get("/api/bills/{bill_id}")
def get_bill(bill_id: str, authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    bill = get_document("bills", bill_id)
    if bill is None:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"success": True, "bill": bill}


@app.put("/api/bills/{bill_id}")
def update_bill(bill_id: str, payload: Dict[str, Any], authorization: Optional[str] = Header(default=None)):
    verify_token(authorization)
    existing = get_document("bills", bill_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Bill not found")
    updated = {**existing, **payload}
    updated["updatedAt"] = utc_now_iso()
    saved = save_document("bills", bill_id, updated)
    return {"success": True, "bill": saved}


@app.get("/")
def root():
    return {"service": "Madhuban Traders API", "status": "running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=False)