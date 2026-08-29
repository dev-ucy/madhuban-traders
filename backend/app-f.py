import hashlib
import os
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel, Field

PORT = int(os.getenv("PORT", "8080"))
PROJECT_ID = os.getenv("FIRESTORE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT") or "demo-project"

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
}


try:
    db = firestore.Client(project=PROJECT_ID)
    db.collection("_health_check").limit(1).get()
    print(f"Firestore connected for project: {PROJECT_ID}")
except Exception as exc:  # pragma: no cover - environment specific fallback
    db = None
    print(f"Firestore unavailable. Using in-memory fallback. Details: {exc}")


class WorkerLoginRequest(BaseModel):
    username: str
    password: str


class BillPayload(BaseModel):
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    items: List[Dict[str, Any]] = Field(default_factory=list)
    totalAmount: Optional[float] = 0
    paymentMethod: Optional[str] = "cash"


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
        workers_ref = db.collection("workers")
        worker_doc = workers_ref.document("shop1").get()
        if not worker_doc.exists:
            workers_ref.document("shop1").set(
                {
                    "id": "w1",
                    "username": "shop1",
                    "passwordHash": hash_password("shop123"),
                    "name": "Shop Manager 1",
                    "role": "manager",
                    "createdAt": utc_now_iso(),
                }
            )
        return

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


def get_store_collection(collection_name: str):
    if db is not None:
        return db.collection(collection_name)
    return None


def normalize_doc(doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(payload)
    normalized.setdefault("id", doc_id)
    normalized.setdefault("createdAt", utc_now_iso())
    normalized.setdefault("receivedAt", normalized["createdAt"])
    return normalized


def list_documents(collection_name: str) -> List[Dict[str, Any]]:
    if db is not None:
        docs = get_store_collection(collection_name).stream()
        items = []
        for doc in docs:
            data = doc.to_dict() or {}
            items.append(data)
        return items

    return list(fallback_store.get(collection_name, {}).values())


def get_document(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
    if db is not None:
        doc = get_store_collection(collection_name).document(str(doc_id)).get()
        if not doc.exists:
            return None
        return dict(doc.to_dict() or {})

    return fallback_store.get(collection_name, {}).get(str(doc_id))


def save_document(collection_name: str, doc_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = normalize_doc(doc_id, payload)

    if db is not None:
        get_store_collection(collection_name).document(str(doc_id)).set(normalized)
        return normalized

    fallback_store.setdefault(collection_name, {})[str(doc_id)] = normalized
    return normalized


def delete_document(collection_name: str, doc_id: str) -> bool:
    if db is not None:
        doc_ref = get_store_collection(collection_name).document(str(doc_id))
        if not doc_ref.get().exists:
            return False
        doc_ref.delete()
        return True

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
        workers = db.collection("workers").stream()
        for worker in workers:
            raw = worker.to_dict() or {}
            if raw.get("token") == token:
                return raw
        raise HTTPException(status_code=401, detail="Invalid token")

    for worker in fallback_store["workers"].values():
        if worker.get("token") == token:
            return worker
    raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "timestamp": utc_now_iso(), "project": PROJECT_ID}


@app.post("/api/auth/login")
def login(payload: WorkerLoginRequest):
    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail="Username and password required")

    if db is not None:
        worker_doc = db.collection("workers").document(str(payload.username)).get()
        if worker_doc.exists:
            worker = worker_doc.to_dict() or {}
        else:
            worker = None
    else:
        worker = fallback_store["workers"].get(str(payload.username))

    if not worker or worker.get("passwordHash") != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = generate_token()
    worker["token"] = token
    worker["lastLogin"] = utc_now_iso()

    if db is not None:
        db.collection("workers").document(str(payload.username)).set(worker)
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
        db.collection("workers").document(str(worker.get("username"))).set(worker)
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


@app.post("/api/bills")
def create_bill(payload: BillPayload, authorization: Optional[str] = Header(default=None)):
    worker = verify_token(authorization)
    if not payload.items:
        raise HTTPException(status_code=400, detail="Bill must contain at least one item")

    existing = list_documents("bills")
    next_id = max((int(item.get("id", 0)) for item in existing), default=999) + 1
    bill = {
        "id": next_id,
        "billNumber": f"BILL-{next_id}",
        "customerName": payload.customerName or "Walk-in Customer",
        "customerPhone": payload.customerPhone or "",
        "items": payload.items,
        "totalAmount": payload.totalAmount,
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
