# main.py
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
import os
from enum import Enum
import uuid

# ============= CONFIGURATION =============
app = FastAPI(title="School Portal API")

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
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ============= ENUMS =============
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

class Semester(str, Enum):
    FIRST = "First Semester"
    SECOND = "Second Semester"

# ============= PYDANTIC MODELS =============

# Auth
class LoginRequest(BaseModel):
    reg_no: str
    password: str

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
    payment_id: int
    approved: bool
    rejection_reason: Optional[str] = None

# Results
class ResultCreate(BaseModel):
    student_id: str  # UUID as string
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

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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
    """Login for both students and admins"""
    response = supabase.table("users").select("*").eq("reg_no", request.reg_no).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = response.data[0]
    
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if student is suspended
    if user["role"] == UserRole.STUDENT and user.get("status") == StudentStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Account suspended")
    
    # Convert UUID to string for JWT
    token = create_access_token({"user_id": str(user["id"]), "role": user["role"]})
    
    # Remove password from response
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

@app.post("/api/admin/users/create")
async def create_user(user: UserCreate, admin: dict = Depends(get_admin_user)):
    """Create new user (student or admin)"""
    # Check if reg_no already exists
    existing = supabase.table("users").select("id").eq("reg_no", user.reg_no).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Registration number already exists")
    
    user_data = {
        "reg_no": user.reg_no,
        "email": user.email,
        "full_name": user.full_name,
        "department": user.department,
        "phone": user.phone,
        "role": user.role,
        "password": hash_password(user.password),
        "status": StudentStatus.ACTIVE if user.role == UserRole.STUDENT else None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("users").insert(user_data).execute()
    return {"message": "User created successfully", "user": response.data[0]}

@app.get("/api/admin/users")
async def get_all_users(admin: dict = Depends(get_admin_user), role: Optional[str] = None):
    """Get all users with optional role filter"""
    query = supabase.table("users").select("*")
    if role:
        query = query.eq("role", role)
    response = query.execute()
    
    # Remove passwords
    users = [{k: v for k, v in user.items() if k != "password"} for user in response.data]
    return users

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
    current_user: dict = Depends(get_current_user)
):
    """Get courses filtered by department, session, and semester"""
    query = supabase.table("courses").select("*")
    
    # Students only see courses for their department
    if current_user["role"] == UserRole.STUDENT:
        query = query.eq("department", current_user["department"])
    
    if session:
        query = query.eq("session", session)
    if semester:
        query = query.eq("semester", semester)
    
    response = query.execute()
    return response.data

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
async def get_registered_courses(current_user: dict = Depends(get_current_user)):
    """Get all courses registered by student with payment status"""
    response = supabase.table("course_registrations")\
        .select("*, courses(*)")\
        .eq("student_id", current_user["id"])\
        .execute()
    
    # Get payment status for each course
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
    
    return registrations

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
    upload_result = cloudinary.uploader.upload(file.file, folder="payment_receipts")
    
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
async def get_all_payments(admin: dict = Depends(get_admin_user), status: Optional[str] = None):
    """Get all payment records with student and course info"""
    query = supabase.table("course_payments").select("*, users(full_name, reg_no), courses(course_code, title)")
    if status:
        query = query.eq("status", status)
    response = query.order("created_at", desc=True).execute()
    return response.data

@app.patch("/api/admin/payments/{payment_id}/approve")
async def approve_payment(
    payment_id: int,
    approved: bool,
    rejection_reason: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    """Approve or reject payment"""
    update_data = {
        "status": PaymentStatus.APPROVED if approved else PaymentStatus.REJECTED,
        "reviewed_at": datetime.utcnow().isoformat(),
        "reviewed_by": admin["id"]
    }
    
    if not approved and rejection_reason:
        update_data["rejection_reason"] = rejection_reason
    
    supabase.table("course_payments").update(update_data).eq("id", payment_id).execute()
    
    # If approved, register the student for the course
    if approved:
        payment = supabase.table("course_payments").select("*").eq("id", payment_id).execute().data[0]
        
        # Check if already registered
        existing = supabase.table("course_registrations")\
            .select("id")\
            .eq("student_id", payment["student_id"])\
            .eq("course_id", payment["course_id"])\
            .execute()
        
        if not existing.data:
            registration_data = {
                "student_id": payment["student_id"],
                "course_id": payment["course_id"],
                "registered_at": datetime.utcnow().isoformat()
            }
            supabase.table("course_registrations").insert(registration_data).execute()
    
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
        folder="course_materials",
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
async def get_course_materials(course_id: int, current_user: dict = Depends(get_current_user)):
    """Get materials for a registered course"""
    # Check if student is registered and payment approved
    registration = supabase.table("course_registrations")\
        .select("*")\
        .eq("student_id", current_user["id"])\
        .eq("course_id", course_id)\
        .execute()
    
    if not registration.data:
        raise HTTPException(status_code=403, detail="You must register and pay for this course")
    
    # Get materials
    materials = supabase.table("course_materials")\
        .select("*")\
        .eq("course_id", course_id)\
        .execute()
    
    return materials.data

@app.get("/api/admin/materials")
async def get_all_materials(admin: dict = Depends(get_admin_user)):
    """Get all course materials"""
    materials = supabase.table("course_materials")\
        .select("*, courses(course_code, title)")\
        .execute()
    return materials.data

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
    current_user: dict = Depends(get_current_user)
):
    """Get student results with GPA calculation"""
    query = supabase.table("results")\
        .select("*, courses(course_code, title)")\
        .eq("student_id", current_user["id"])
    
    if session:
        query = query.eq("session", session)
    if semester:
        query = query.eq("semester", semester)
    
    response = query.execute()
    results = response.data
    
    gpa = calculate_gpa(results)
    
    return {
        "results": results,
        "gpa": gpa,
        "total_courses": len(results)
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
        folder="profile_pictures",
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
async def get_announcements(current_user: dict = Depends(get_current_user)):
    """Get announcements for user's department"""
    query = supabase.table("announcements").select("*, users(full_name)")
    
    if current_user["role"] == UserRole.STUDENT:
        query = query.or_(f"target_department.eq.{current_user['department']},target_department.is.null")
    
    response = query.order("created_at", desc=True).execute()
    return response.data

@app.delete("/api/admin/announcements/{announcement_id}")
async def delete_announcement(announcement_id: int, admin: dict = Depends(get_admin_user)):
    """Delete announcement"""
    supabase.table("announcements").delete().eq("id", announcement_id).execute()
    return {"message": "Announcement deleted successfully"}

# ============= DASHBOARD STATS =============

@app.get("/api/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    students_count = supabase.table("users").select("id", count="exact").eq("role", UserRole.STUDENT).execute()
    courses_count = supabase.table("courses").select("id", count="exact").execute()
    
    payments = supabase.table("course_payments").select("amount_paid, status").execute()
    total_revenue = sum(p["amount_paid"] for p in payments.data if p["status"] == PaymentStatus.APPROVED)
    pending_payments = len([p for p in payments.data if p["status"] == PaymentStatus.PENDING])
    
    # Recent registrations
    recent_registrations = supabase.table("course_registrations")\
        .select("*, users(full_name, reg_no), courses(course_code, title)")\
        .order("registered_at", desc=True)\
        .limit(10)\
        .execute()
    
    return {
        "total_students": students_count.count,
        "total_courses": courses_count.count,
        "total_revenue": total_revenue,
        "pending_payments": pending_payments,
        "recent_registrations": recent_registrations.data
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