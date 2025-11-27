from pydantic import BaseModel
from typing import Optional

class RegisterCourse(BaseModel):
    course_id: str

class UploadPaymentProof(BaseModel):
    proof_url: str
