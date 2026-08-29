import hashlib
import os
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
            return res.data or []
        except Exception as exc:  # pragma: no cover
            print(f"Falling back for collection {collection_name}: {exc}")

    return list(fallback_store.get(collection_name, {}).values())


def get_document(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
    if db is not None:
        try:
            res = db.table(collection_name).select("*").eq("id", str(doc_id)).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception as exc:  # pragma: no cover
            print(f"Falling back for get_document {collection_name}/{doc_id}: {exc}")

    return fallback_store.get(collection_name, {}).get(str(doc_id))


def save_document(collection_name: str, doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = normalize_doc(doc_id, payload)

    if db is not None:
        try:
            # Upsert: Insert or update row based on primary key 'id'
            db.table(collection_name).upsert(normalized).execute()
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


def generate_token() -> str:
    return secrets.token_hex(32)


def verify_token(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ", 1)[1]

    if db is not None:
        res = db.table("workers").select("*").eq("token", token).execute()
        if res.data:
            return res.data[0]
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
        worker = res.data[0] if res.data else None
    else:
        worker = fallback_store["workers"].get(str(payload.username))

    if not worker or worker.get("passwordHash") != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = generate_token()
    worker["token"] = token
    worker["lastLogin"] = utc_now_iso()

    if db is not None:
        db.table("workers").upsert(worker).execute()
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
        db.table("workers").upsert(worker).execute()
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
    settings = {**get_billing_settings(), **payload.model_dump(exclude_none=True)}
    fallback_store.setdefault("billing_settings", {})["default"] = settings
    save_document("billing_settings", "default", settings)
    return {"success": True, "settings": settings}


@app.post("/api/bills")
def create_bill(payload: BillPayload, authorization: Optional[str] = Header(default=None)):
    worker = verify_token(authorization)
    if not payload.items:
        raise HTTPException(status_code=400, detail="Bill must contain at least one item")

    settings = get_billing_settings()
    existing = list_documents("bills")
    next_id = max((int(item.get("id", 0)) for item in existing), default=999) + 1
    bill = {
        "id": str(next_id),
        "billNumber": f"BILL-{next_id}",
        "customerName": payload.customerName or "Walk-in Customer",
        "customerPhone": payload.customerPhone or "",
        "customerAddress": payload.customerAddress or "",
        "customerGstin": payload.customerGstin or "",
        "customerStateCode": payload.customerStateCode or settings.get("supplierStateCode"),
        "customerStateName": payload.customerStateName or settings.get("supplierStateName"),
        "supplierName": payload.supplierName or settings.get("supplierName"),
        "supplierAddress": payload.supplierAddress or settings.get("supplierAddress"),
        "supplierGstin": payload.supplierGstin or settings.get("supplierGstin"),
        "supplierFssai": payload.supplierFssai or settings.get("supplierFssai"),
        "supplierStateCode": payload.supplierStateCode or settings.get("supplierStateCode"),
        "supplierStateName": payload.supplierStateName or settings.get("supplierStateName"),
        "items": payload.items,
        "totalAmount": payload.totalAmount,
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