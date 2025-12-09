# main.py
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, BackgroundTasks,Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta , timezone
import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
import os
from enum import Enum
import uuid
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field
from collections import Counter
from app.utils.email_service import EmailService
import httpx
import requests
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from collections import Counter

load_dotenv()
email_service = EmailService()

# ============= CONFIGURATION =============
app = FastAPI(title="School Portal API")

DATABASE_URL = os.getenv("DATABASE_URL") 

ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    poolclass=NullPool,
    
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0, 
    },
    
    echo=False, 
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

TURNSTILE_ENABLED = os.getenv("TURNSTILE_ENABLED")

# Validate before creating client
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()

# ============= ENUMS ===========
class UserRole(str, Enum):
    ADMIN = "admin"
    STUDENT = "student"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class StudentStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    GRADUATED = "graduated"

class AdminStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"

class Semester(str, Enum):
    FIRST = "First Semester"
    SECOND = "Second Semester"

# ============= PYDANTIC MODELS =============

# Auth
class LoginRequest(BaseModel):
    reg_no: str
    password: str
    turnstile_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# User
class UserCreate(BaseModel):
    reg_no: str
    email: EmailStr
    full_name: str
    department: str
    phone: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    password: str = "1234567"

class AdminUserCreateRequest(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    password: str = "1234567"

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

# Course
class CourseCreate(BaseModel):
    course_code: str
    title: str
    department: str
    session: str
    semester: Semester
    fee: float

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    fee: Optional[float] = None

# Course Registration
class CourseRegistrationRequest(BaseModel):
    course_id: int

# Payment
class PaymentProofUpload(BaseModel):
    course_id: int
    amount_paid: float
    receipt_url: str

class PaymentApproval(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None

# Results
class ResultCreate(BaseModel):
    student_id: str
    course_id: int
    score: float
    grade: str

# Material
class MaterialCreate(BaseModel):
    course_id: int
    title: str
    file_url: str
    file_type: str

# Announcement
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_department: Optional[str] = None

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_next_admin_reg_no():
    """Finds the highest existing ADMIN### and increments it."""
    response = supabase.table("users")\
        .select("reg_no")\
        .ilike("reg_no", "ADMIN%")\
        .order("reg_no", desc=True)\
        .limit(1)\
        .execute()
    
    if not response.data:
        return "ADMIN001"
    
    latest_reg_no = response.data[0]["reg_no"]
    
    try:
        current_number = int(latest_reg_no[5:])
        next_number = current_number + 1
        return f"ADMIN{next_number:03d}"
    except (ValueError, IndexError):
        return "ADMIN001"

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


if TURNSTILE_ENABLED:
    def verify_turnstile(token: str, remote_ip: str = None):
        secret = os.getenv("CLOUDFLARE_SECRET_KEY")

        url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
        payload = {
            "secret": secret,
            "response": token,
        }

        if remote_ip:
            payload["remoteip"] = remote_ip

        response = requests.post(url, data=payload)
        result = response.json()

        return result.get("success", False)
else:
    pass

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="User not found")
    
    return response.data[0]

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def calculate_gpa(results: List[dict]) -> float:
    """Calculate GPA from results"""
    grade_points = {"A": 5.0, "B": 4.0, "C": 3.0, "D": 2.0, "E": 1.0, "F": 0.0}
    if not results:
        return 0.0
    total_points = sum(grade_points.get(r["grade"], 0.0) for r in results)
    return round(total_points / len(results), 2)

# ============= AUTHENTICATION ENDPOINTS =============

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    # Verify Turnstile 
    if not verify_turnstile(request.turnstile_token):
        raise HTTPException(status_code=400, detail="Turnstile verification failed")

    response = supabase.table("users").select("*").eq("reg_no", request.reg_no).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = response.data[0]
    
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user["role"] == UserRole.STUDENT and user.get("status") == StudentStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Account suspended")
    
    token = create_access_token({"user_id": str(user["id"]), "role": user["role"]})
    
    user_data = {k: v for k, v in user.items() if k != "password"}
    
    return TokenResponse(access_token=token, user=user_data)

@app.post("/api/auth/change-password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    """Change user password"""
    if not verify_password(data.old_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hashed = hash_password(data.new_password)
    supabase.table("users").update({"password": new_hashed}).eq("id", current_user["id"]).execute()
    
    return {"message": "Password changed successfully"}

# ============= USER MANAGEMENT (ADMIN) =============
# ADMIN USER - NEW ENDPOINT
@app.post("/api/admin/adminusers/create")
async def create_admin_user(
    user_request: AdminUserCreateRequest, 
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_admin_user)
):
    # 1. Generate new unique registration number
    new_reg_no = get_next_admin_reg_no()
    
    # 2. Check if this newly generated reg_no somehow already exists (safety check)
    existing = supabase.table("users").select("id").eq("reg_no", new_reg_no).execute()
    if existing.data:
        # This should ideally not happen if sequence logic is correct
        raise HTTPException(status_code=400, detail="Generated Registration number already exists, please retry.") 

    raw_password = user_request.password
    hashed_pwd = hash_password(user_request.password)
    
    user_data = {
        "reg_no": new_reg_no,
        "email": user_request.email,
        "full_name": user_request.full_name,
        "department": "Administration", 
        "phone": user_request.phone,
        "role": UserRole.ADMIN,
        "password": hashed_pwd,
        "status": AdminStatus.ACTIVE,
        "created_by": admin["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("users").insert(user_data).execute()
    new_user = response.data[0]

    email_body = f"""
    <p>Welcome to WMOU Portal, <strong>{user_request.full_name}</strong>!</p>
    <p>Your account has been successfully created.</p>
    <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Registration Number:</strong> {new_reg_no}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> {raw_password}</p>
    </div>
    <p>Please login and change your password immediately.</p>
    """
    background_tasks.add_task(
        email_service.send_user_welcome, 
        student_email=user_request.email,
        full_name=user_request.full_name,
        reg_no=new_reg_no,
        password=raw_password 
    )

    return {"message": "Admin user created successfully", "user": new_user}

# STUDENT
@app.post("/api/admin/users/create")
async def create_user(
    user: UserCreate, 
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_admin_user)
):
    """Create new user (Task 4 & 7 & 8)"""
    # Check if reg_no already exists
    existing = supabase.table("users").select("id").eq("reg_no", user.reg_no).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Registration number already exists")

    raw_password = user.password
    hashed_pwd = hash_password(user.password)
    
    user_data = {
        "reg_no": user.reg_no,
        "email": user.email,
        "full_name": user.full_name,
        "department": user.department,
        "phone": user.phone,
        "role": user.role,
        "password": hashed_pwd,
        "status": StudentStatus.ACTIVE if user.role == UserRole.STUDENT else None,
        "created_by": admin["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("users").insert(user_data).execute()
    new_user = response.data[0]

    # Task 7: Send Welcome Email
    email_body = f"""
    <p>Welcome to WMOU Portal, <strong>{user.full_name}</strong>!</p>
    <p>Your account has been successfully created.</p>
    <div style="background-color: #e2e8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Registration Number:</strong> {user.reg_no}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> {user.password}</p>
    </div>
    <p>Please login and change your password immediately.</p>
    """
    background_tasks.add_task(
        email_service.send_user_welcome, 
        student_email=user.email,
        full_name=user.full_name,
        reg_no=user.reg_no,
        password=raw_password 
    )

    return {"message": "User created successfully", "user": new_user}

@app.get("/api/admin/users")
async def get_all_users(
    admin: dict = Depends(get_admin_user), 
    role: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    offset = (page - 1) * limit
    
    # Query is correct: creator:users!created_by uses the foreign key 'created_by' 
    # on the current table to find the creator's full_name.
    query = (
        supabase.table("users")
        .select("*, course_registrations(count), creator:users!created_by(full_name)", count="exact")
    )
        
    if role:
        query = query.eq("role", role)
    
    response = (
        query.range(offset, offset + limit - 1)
        .order("created_at", desc=True)
        .execute()
    )
    
    users = []
    for user in response.data:
        # 1. Clean up user data
        # Remove original created_by UUID and password
        user_clean = {k: v for k, v in user.items() if k not in ["password", "created_by"]} 
        
        # 2. Handle "course_registrations" safely
        reg = user.get("course_registrations")
        count = reg[0].get("count", 0) if isinstance(reg, list) and reg and isinstance(reg[0], dict) else 0
        user_clean["registered_courses_count"] = count
        
        # 3. Handle "creator" safely (Extracting the full_name of the creator)
        creator = user.get("creator")
        creator_name = "System" 
        
        if creator:
            # PostgREST/Supabase sometimes returns a list [ {} ] or a single object {}
            if isinstance(creator, dict):
                creator_name = creator.get("full_name", "System")
            elif isinstance(creator, list) and creator and isinstance(creator[0], dict):
                creator_name = creator[0].get("full_name", "System")
                
        user_clean["created_by_name"] = creator_name

        users.append(user_clean)

    return {
        "data": users,
        "total": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }

@app.patch("/api/admin/users/{user_id}/status")
async def update_user_status(user_id: str, status: StudentStatus, admin: dict = Depends(get_admin_user)):
    """Update student status (active, suspended, graduated)"""
    supabase.table("users").update({"status": status}).eq("id", user_id).execute()
    return {"message": "Status updated successfully"}

# ============= COURSE MANAGEMENT =============

@app.post("/api/admin/courses")
async def create_course(course: CourseCreate, admin: dict = Depends(get_admin_user)):
    """Create new course"""
    course_data = {
        **course.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    response = supabase.table("courses").insert(course_data).execute()
    return {"message": "Course created successfully", "course": response.data[0]}

@app.get("/api/courses")
async def get_courses(
    session: Optional[str] = None,
    semester: Optional[str] = None,
    department: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    offset = (page - 1) * limit

    # --------------------------------------------------------------------
    # STEP 1: COUNT QUERY (SAFE)
    # --------------------------------------------------------------------
    count_query = supabase.table("courses").select("id", count="exact")

    if current_user["role"] == UserRole.STUDENT:
        count_query = count_query.eq("department", current_user["department"])
    elif department:
        count_query = count_query.eq("department", department)

    if session:
        count_query = count_query.eq("session", session)

    if semester:
        count_query = count_query.eq("semester", semester)

    count_res = count_query.execute()
    total_count = count_res.count or 0
    total_pages = (total_count + limit - 1) // limit

    # If page is out of range, return empty data
    if total_count == 0 or page > total_pages:
        return {
            "data": [],
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }

    # --------------------------------------------------------------------
    # STEP 2: MAIN QUERY WITH STUDENT COUNT
    # --------------------------------------------------------------------
    query = (
        supabase
        .table("courses")
        .select("*, course_registrations(count)")
    )

    if current_user["role"] == UserRole.STUDENT:
        query = query.eq("department", current_user["department"])
    elif department:
        query = query.eq("department", department)

    if session:
        query = query.eq("session", session)

    if semester:
        query = query.eq("semester", semester)

    response = query.range(offset, offset + limit - 1).execute()

    # --------------------------------------------------------------------
    # STEP 3: TRANSFORM TO MATCH FRONTEND
    # --------------------------------------------------------------------
    courses = []
    for c in response.data:
        students_count = 0
        if isinstance(c.get("course_registrations"), list) and len(c["course_registrations"]) > 0:
            students_count = c["course_registrations"][0].get("count", 0)

        courses.append({
            **c,
            "students_count": students_count
        })

    return {
        "data": courses,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@app.patch("/api/admin/courses/{course_id}")
async def update_course(course_id: int, course: CourseUpdate, admin: dict = Depends(get_admin_user)):
    """Update course details"""
    update_data = {k: v for k, v in course.dict().items() if v is not None}
    supabase.table("courses").update(update_data).eq("id", course_id).execute()
    return {"message": "Course updated successfully"}

@app.delete("/api/admin/courses/{course_id}")
async def delete_course(course_id: int, admin: dict = Depends(get_admin_user)):
    """Delete a course"""
    supabase.table("courses").delete().eq("id", course_id).execute()
    return {"message": "Course deleted successfully"}

# ============= COURSE REGISTRATION =============

@app.get("/api/student/registered-courses")
async def get_registered_courses(
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 20
):
    """Get all courses registered by student with payment status"""
    offset = (page - 1) * limit
    
    response = supabase.table("course_registrations")\
        .select("*, courses(*)", count="exact")\
        .eq("student_id", current_user["id"])\
        .range(offset, offset + limit - 1)\
        .execute()
    
    registrations = []
    for reg in response.data:
        payment = supabase.table("course_payments")\
            .select("*")\
            .eq("student_id", current_user["id"])\
            .eq("course_id", reg["course_id"])\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        reg["payment_status"] = payment.data[0] if payment.data else None
        registrations.append(reg)
    
    return {
        "data": registrations,
        "total": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }

@app.get("/api/student/courses-with-payment-status")
async def get_courses_with_payment_status(
    session: str,
    semester: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all available courses with payment status for student"""
    # Get all courses for student's department
    courses = supabase.table("courses")\
        .select("*")\
        .eq("department", current_user["department"])\
        .eq("session", session)\
        .eq("semester", semester)\
        .execute()
    
    # Check payment status for each course
    courses_with_status = []
    for course in courses.data:
        # Check latest payment
        payment = supabase.table("course_payments")\
            .select("*")\
            .eq("student_id", current_user["id"])\
            .eq("course_id", course["id"])\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        course["payment"] = payment.data[0] if payment.data else None
        courses_with_status.append(course)
    
    return courses_with_status

# ============= PAYMENT FLOW =============

@app.post("/api/student/payment/upload-proof")
async def upload_payment_proof(
    course_id: int,
    amount_paid: float,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Student uploads payment receipt"""
    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(file.file, folder="wmou_portal/payment_receipts")
    
    # Create payment record
    payment_data = {
        "student_id": current_user["id"],
        "course_id": course_id,
        "amount_paid": amount_paid,
        "receipt_url": upload_result["secure_url"],
        "status": PaymentStatus.PENDING,
        "created_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("course_payments").insert(payment_data).execute()
    
    return {
        "message": "Payment proof uploaded successfully",
        "payment": response.data[0]
    }

@app.get("/api/admin/payments")
async def get_all_payments(
    admin: dict = Depends(get_admin_user), 
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 30
):
    """Get payments with reviewer info (Task 5)"""
    offset = (page - 1) * limit
    
    # Task 5: Select reviewer name
    query = supabase.table("course_payments")\
        .select("*, users!course_payments_student_id_fkey(full_name, reg_no), courses(course_code, title), reviewer:users!course_payments_reviewed_by_fkey(full_name)", count="exact")
        
    if status:
        query = query.eq("status", status)
    
    response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    payments = []
    for p in response.data:
        p['reviewed_by_name'] = p.get('reviewer', {}).get('full_name', 'N/A') if p.get('reviewer') else 'N/A'
        payments.append(p)

    return {
        "data": payments,
        "total": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }

@app.post("/api/student/payment/upload-proof-bulk")
async def upload_payment_proof_bulk(
    course_ids: List[int],
    total_amount: float,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Student uploads single payment receipt for multiple courses"""
    
    # Validate courses exist
    courses = supabase.table("courses")\
        .select("id, fee, title, course_code")\
        .in_("id", course_ids)\
        .execute()
    
    if len(courses.data) != len(course_ids):
        raise HTTPException(status_code=404, detail="One or more courses not found")
    
    # Calculate expected total
    expected_total = sum(c["fee"] for c in courses.data)
    if abs(total_amount - expected_total) > 0.01:
        raise HTTPException(status_code=400, detail=f"Amount mismatch. Expected: {expected_total}, Received: {total_amount}")
    
    # Upload receipt once
    upload_result = cloudinary.uploader.upload(file.file, folder="wmou_portal/payment_receipts")
    
    # Create payment records for each course
    payment_records = []
    for course in courses.data:
        payment_data = {
            "student_id": current_user["id"],
            "course_id": course["id"],
            "amount_paid": course["fee"],
            "receipt_url": upload_result["secure_url"],
            "status": PaymentStatus.PENDING,
            "created_at": datetime.utcnow().isoformat()
        }
        payment_records.append(payment_data)
    
    response = supabase.table("course_payments").insert(payment_records).execute()
    
    return {
        "message": f"Payment proof uploaded for {len(course_ids)} courses",
        "courses": [c["course_code"] for c in courses.data],
        "total_amount": total_amount,
        "payments": response.data
    }

@app.get("/api/student/payment-history")
async def get_student_payment_history(
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 20
):
    """Get student's payment history"""
    offset = (page - 1) * limit
    
    query = supabase.table("course_payments")\
        .select("*, courses(course_code, title), reviewer:users!course_payments_reviewed_by_fkey(full_name)", count="exact")\
        .eq("student_id", current_user["id"])
    
    response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    payments = []
    for p in response.data:
        p['reviewed_by_name'] = p.get('reviewer', {}).get('full_name', 'N/A') if p.get('reviewer') else 'N/A'
        payments.append(p)

    return {
        "data": payments,
        "total": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }

@app.patch("/api/admin/payments/{payment_id}/approve")
async def approve_payment(
    payment_id: int,
    review_data: PaymentApproval,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_admin_user)
):
    approved = review_data.approved
    rejection_reason = review_data.rejection_reason

    reviewed_at = datetime.now(timezone.utc).isoformat()

    update_data = {
        "status": PaymentStatus.APPROVED if approved else PaymentStatus.REJECTED,
        "reviewed_at": reviewed_at,
        "reviewed_by": admin["id"]
    }

    if not approved and rejection_reason:
        update_data["rejection_reason"] = rejection_reason

    # STEP 1: UPDATE
    update_response = (
        supabase.table("course_payments")
        .update(update_data)
        .eq("id", payment_id)
        .execute()
    )

    if not update_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found."
        )

    # STEP 2: SELECT WITH EXPLICIT RELATIONSHIPS
    payment_response = (
        supabase.table("course_payments")
        .select(
            "*, "
            "student:users!course_payments_student_id_fkey(email, full_name), "
            "reviewer:users!course_payments_reviewed_by_fkey(email, full_name), "
            "courses(title)"
        )
        .eq("id", payment_id)
        .single()
        .execute()
    )

    payment_record = payment_response.data

    # STEP 3: REGISTER STUDENT IF PAYMENT APPROVED
    if approved:
        existing = (
            supabase.table("course_registrations")
            .select("id")
            .eq("student_id", payment_record["student_id"])
            .eq("course_id", payment_record["course_id"])
            .execute()
        )

        if not existing.data:
            registration_data = {
                "student_id": payment_record["student_id"],
                "course_id": payment_record["course_id"],
                "registered_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table("course_registrations").insert(registration_data).execute()

    # STEP 4: EMAIL NOTIFICATION
    background_tasks.add_task(
        email_service.send_payment_approval,
        student_email=payment_record["student"]["email"],
        course_name=payment_record["courses"]["title"],
        approved=approved,
        rejection_reason=rejection_reason
    )

    return {"message": "Payment processed successfully"}

# ============= COURSE MATERIALS =============

@app.post("/api/admin/materials")
async def upload_material(
    course_id: int,
    title: str,
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    """Upload course material"""
    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(
        file.file,
        folder="wmou_portal/course_materials",
        resource_type="auto"
    )
    
    material_data = {
        "course_id": course_id,
        "title": title,
        "file_url": upload_result["secure_url"],
        "file_type": file.content_type,
        "uploaded_by": admin["id"],
        "uploaded_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("course_materials").insert(material_data).execute()
    return {"message": "Material uploaded successfully", "material": response.data[0]}

@app.get("/api/student/materials/{course_id}")
async def get_course_materials(
    course_id: int, 
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 20
):
    """Get materials for a registered course"""
    registration = supabase.table("course_registrations")\
        .select("*")\
        .eq("student_id", current_user["id"])\
        .eq("course_id", course_id)\
        .execute()
    
    if not registration.data:
        raise HTTPException(status_code=403, detail="You must register and pay for this course")
    
    offset = (page - 1) * limit
    
    materials = supabase.table("course_materials")\
        .select("*", count="exact")\
        .eq("course_id", course_id)\
        .range(offset, offset + limit - 1)\
        .execute()
    
    return {
        "data": materials.data,
        "total": materials.count,
        "page": page,
        "limit": limit,
        "total_pages": (materials.count + limit - 1) // limit
    }

@app.get("/api/admin/materials")
async def get_all_materials(
    admin: dict = Depends(get_admin_user),
    page: int = 1,
    limit: int = 20
):
    """Get all course materials"""
    offset = (page - 1) * limit
    
    materials = supabase.table("course_materials")\
        .select("*, courses(course_code, title)", count="exact")\
        .range(offset, offset + limit - 1)\
        .execute()
    
    return {
        "data": materials.data,
        "total": materials.count,
        "page": page,
        "limit": limit,
        "total_pages": (materials.count + limit - 1) // limit
    }

@app.delete("/api/admin/materials/{material_id}")
async def delete_material(material_id: int, admin: dict = Depends(get_admin_user)):
    """Delete course material"""
    supabase.table("course_materials").delete().eq("id", material_id).execute()
    return {"message": "Material deleted successfully"}

# ============= RESULTS =============

@app.post("/api/admin/results/bulk-upload")
async def bulk_upload_results(
    session: str,
    semester: str,
    results: List[ResultCreate],
    admin: dict = Depends(get_admin_user)
):
    """Bulk upload results (from Excel parsing)"""
    results_data = [
        {
            **result.dict(),
            "session": session,
            "semester": semester,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        for result in results
    ]
    
    response = supabase.table("results").upsert(results_data).execute()
    return {"message": f"{len(results_data)} results uploaded successfully"}

@app.get("/api/student/results")
async def get_student_results(
    session: Optional[str] = None,
    semester: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get student results with GPA calculation"""
    offset = (page - 1) * limit
    
    query = supabase.table("results")\
        .select("*, courses(course_code, title)", count="exact")\
        .eq("student_id", current_user["id"])
    
    if session:
        query = query.eq("session", session)
    if semester:
        query = query.eq("semester", semester)
    
    response = query.range(offset, offset + limit - 1).execute()
    results = response.data
    
    gpa = calculate_gpa(results)
    
    return {
        "results": results,
        "gpa": gpa,
        "total_courses": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }
# ============= PROFILE =============

@app.get("/api/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile"""
    user_data = {k: v for k, v in current_user.items() if k != "password"}
    return user_data

@app.patch("/api/profile")
async def update_profile(data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
    return {"message": "Profile updated successfully"}

@app.post("/api/profile/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile picture"""
    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(
        file.file,
        folder="wmou/profile_pictures",
        transformation=[{"width": 400, "height": 400, "crop": "fill"}]
    )
    
    # Update user profile
    supabase.table("users").update({
        "profile_picture_url": upload_result["secure_url"]
    }).eq("id", current_user["id"]).execute()
    
    return {
        "message": "Profile picture uploaded successfully",
        "url": upload_result["secure_url"]
    }

# ============= ANNOUNCEMENTS =============

@app.post("/api/admin/announcements")
async def create_announcement(announcement: AnnouncementCreate, admin: dict = Depends(get_admin_user)):
    """Create announcement"""
    announcement_data = {
        **announcement.dict(),
        "created_by": admin["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    response = supabase.table("announcements").insert(announcement_data).execute()
    return {"message": "Announcement created", "announcement": response.data[0]}

@app.get("/api/announcements")
async def get_announcements(
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 10
):
    """Get announcements for user's department"""
    offset = (page - 1) * limit
    
    query = supabase.table("announcements").select("*, users(full_name)", count="exact")
    
    if current_user["role"] == UserRole.STUDENT:
        query = query.or_(f"target_department.eq.{current_user['department']},target_department.is.null")
    
    response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {
        "data": response.data,
        "total": response.count,
        "page": page,
        "limit": limit,
        "total_pages": (response.count + limit - 1) // limit
    }

@app.delete("/api/admin/announcements/{announcement_id}")
async def delete_announcement(announcement_id: int, admin: dict = Depends(get_admin_user)):
    """Delete announcement"""
    supabase.table("announcements").delete().eq("id", announcement_id).execute()
    return {"message": "Announcement deleted successfully"}

# ============= DASHBOARD STATS (FIXED) =============
@app.get("/api/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(get_admin_user)):
    """
    Retrieve comprehensive admin dashboard metrics, including student, course, 
    financial, and activity summaries.
    """
    
    # Setup for Time-Based Filters
    # from datetime import timezone # Moved to top-level imports
    
    # Calculate the exact UTC datetime 30 days ago
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Format the datetime object into a clean ISO 8601 string (YYYY-MM-DDTHH:MM:SSZ)
    thirty_days_ago_iso = thirty_days_ago.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Helper to safely parse Supabase date strings for in-memory calculations
    def parse_dt(x: Optional[str]) -> datetime:
        if not x: return datetime.min
        try:
            if 'Z' in x or '+' in x:
                return datetime.fromisoformat(x.replace("Z", "+00:00"))
            # Fallback for the database timestamp format observed
            if "." in x: x = x.split(".")[0]
            return datetime.strptime(x, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except Exception:
            return datetime.min

    # ================== 1. Student Metrics ==================

    # Total Active Students and Department Grouping (Fetch all relevant students once)
    students_query = (
        supabase.table("users")
        .select("id, status, department, created_at")
        .eq("role", UserRole.STUDENT)
        .execute()
    )
    students = students_query.data

    # Count: Total Active Students (Robust check using strip)
    total_active_students = len([
        s for s in students
        if s.get("status") and s["status"].strip().lower() == "active"
    ])

    # Count: New Students (Last 30 days) - Performed via Supabase filter for reliability
    new_students_count = (
        supabase.table("users")
        .select("id", count="exact")
        .eq("role", UserRole.STUDENT)
        .gte("created_at", thirty_days_ago_iso) # Using the clean ISO string
        .execute()
        .count
    )

    # Group by department
    dept_counts = Counter(s.get("department") for s in students if s.get("department"))
    students_by_dept = [
        {"name": dept, "value": count}
        for dept, count in dept_counts.items()
    ]


    # ================== 2. Course Metrics ==================

    # Fetch courses with registration count
    courses_query = (
        supabase.table("courses")
        .select("id, title, course_registrations(count)")
        .execute()
    )
    courses = courses_query.data
    total_courses = len(courses)

    # Helper function to safely extract registration count
    def extract_count(c):
        reg = c.get("course_registrations")
        if isinstance(reg, list) and reg and isinstance(reg[0], dict):
            return reg[0].get("count", 0)
        return 0

    # Determine most enrolled course
    courses_sorted = sorted(courses, key=extract_count, reverse=True)

    most_enrolled = (
        {
            "title": courses_sorted[0]["title"],
            "count": extract_count(courses_sorted[0]),
        }
        if courses_sorted else {"title": "N/A", "count": 0}
    )

    # Count total materials
    materials_count = (
        supabase.table("course_materials")
        .select("id", count="exact")
        .execute()
        .count
    )

    # ================== 3. Payment Metrics ==================

    # Fetch all payments
    payments_query = (
        supabase.table("course_payments")
        .select("amount_paid, status, created_at")
        .execute()
    )
    payments = payments_query.data

    # Calculate Total Revenue (Robust summing)
    total_revenue = sum(
        p.get("amount_paid", 0) or 0
        for p in payments
        if p.get("status") == PaymentStatus.APPROVED and p.get("amount_paid") is not None
    )

    # Count pending payments
    pending_payments_count = len([
        p for p in payments if p.get("status") == PaymentStatus.PENDING
    ])

    # Calculate Revenue Trend (Monthly Dynamics)
    month_map = {}

    for p in payments:
        if p.get("status") == PaymentStatus.APPROVED:
            dt = parse_dt(p["created_at"])
            
            if dt != datetime.min:
                month_key = dt.strftime("%b")
                amount = p.get("amount_paid") or 0
                month_map[month_key] = month_map.get(month_key, 0) + amount

    # Sort months chronologically
    current_year_months = [
        datetime.strptime(str(m), '%m').strftime('%b') for m in range(1, 13)
    ]
    
    revenue_dynamics = [
        {"name": month, "amount": month_map.get(month, 0)}
        for month in current_year_months
        if month in month_map
    ]

    # ================== 4. Activity ==================

    # Overall Status Chart (Student Status Distribution)
    status_counts = Counter(
        s.get("status", "Unknown").capitalize()
        for s in students
        if s.get("status")
    )
    overall_status_chart = [
        {"name": k, "value": v}
        for k, v in status_counts.items()
    ]

    # Latest pending payments (Simple fetch)
    latest_pending_payments = (
        supabase.table("course_payments")
        .select("*") 
        .eq("status", PaymentStatus.PENDING)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
    )

    # Latest announcements
    latest_announcements = (
        supabase.table("announcements")
        .select("*")
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
    )

    # ================== Final Return Structure ==================
    return {
        "student_metrics": {
            "total_active": total_active_students,
            "new_students_30d": new_students_count,
            "by_department": students_by_dept,
        },
        "course_metrics": {
            "total_courses": total_courses,
            "most_enrolled": most_enrolled,
            "total_materials": materials_count,
        },
        "financial_metrics": {
            "total_revenue": total_revenue,
            "pending_count": pending_payments_count,
            "revenue_trend": revenue_dynamics,
        },
        "activity": {
            "status_distribution": overall_status_chart,
            "latest_pending_payments": latest_pending_payments,
            "latest_announcements": latest_announcements,
        },
    }

@app.get("/api/student/dashboard")
async def get_student_dashboard(current_user: dict = Depends(get_current_user)):
    """Get student dashboard statistics"""
    # Registered courses count
    registered = supabase.table("course_registrations")\
        .select("id", count="exact")\
        .eq("student_id", current_user["id"])\
        .execute()
    
    # Pending payments
    pending = supabase.table("course_payments")\
        .select("id", count="exact")\
        .eq("student_id", current_user["id"])\
        .eq("status", PaymentStatus.PENDING)\
        .execute()

    # Pending payments
    approved = supabase.table("course_payments")\
        .select("id", count="exact")\
        .eq("student_id", current_user["id"])\
        .eq("status", PaymentStatus.APPROVED)\
        .execute()
    
    # Latest results
    latest_results = supabase.table("results")\
        .select("*, courses(course_code, title)")\
        .eq("student_id", current_user["id"])\
        .order("uploaded_at", desc=True)\
        .limit(5)\
        .execute()
    
    gpa = calculate_gpa(latest_results.data)
    
    return {
        "registered_courses": registered.count,
        "pending_payments": pending.count,
        "approved_payments": approved.count,
        "gpa": gpa,
        "recent_results": latest_results.data
    }

# ============= HEALTH CHECK =============

@app.get("/")
async def root():
    return {
        "message": "School Portal API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)