from pydantic import BaseModel

class CourseCreate(BaseModel):
    course_code: str
    title: str
    department: str
    session: str
    semester: int
    fee: int

class CourseOut(CourseCreate):
    id: str
