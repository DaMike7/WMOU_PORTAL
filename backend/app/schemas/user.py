from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    reg_no: Optional[str] = None
    full_name: str
    email: Optional[str] = None
    department: Optional[str] = None
    user_type: str = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    reg_no: str
    password: str

class UserOut(UserBase):
    id: str
