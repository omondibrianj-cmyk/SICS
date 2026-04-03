from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
import hashlib

router = APIRouter()

# Input models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str
    phone: str = ""

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register")
def register(request: RegisterRequest):
    db = get_db()
    
    # Check if email already exists
    existing = db.table("users").select("*").eq(
        "email", request.email
    ).execute()
    
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    new_user = {
        "full_name": request.full_name,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "role": request.role,
        "phone": request.phone
    }
    
    result = db.table("users").insert(new_user).execute()
    
    return {
        "message": "user registered successfully",
        "user": {
            "full_name": request.full_name,
            "email": request.email,
            "role": request.role
        }
    }

@router.post("/login")
def login(request: LoginRequest):
    db = get_db()
    
    # Find user by email
    result = db.table("users").select("*").eq(
        "email", request.email
    ).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )
    
    user = result.data[0]
    
    # Check password
    if user["password_hash"] != hash_password(request.password):
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )
    
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    }