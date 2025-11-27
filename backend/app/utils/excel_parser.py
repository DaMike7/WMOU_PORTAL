import pandas as pd
from typing import List, Dict

def parse_students_excel(file_path: str) -> List[Dict]:
    """
    Parse Excel file with student data
    Expected columns: reg_no, email, full_name, department, phone
    """
    df = pd.read_excel(file_path)
    
    # Validate required columns
    required_columns = ['reg_no', 'email', 'full_name', 'department']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
    
    # Convert to list of dicts
    students = df.to_dict('records')
    
    # Clean and validate data
    cleaned_students = []
    for student in students:
        if pd.isna(student['reg_no']) or pd.isna(student['email']):
            continue  # Skip rows with missing critical data
        
        cleaned_student = {
            'reg_no': str(student['reg_no']).strip(),
            'email': str(student['email']).strip().lower(),
            'full_name': str(student['full_name']).strip(),
            'department': str(student['department']).strip(),
            'phone': str(student.get('phone', '')).strip() if not pd.isna(student.get('phone')) else None,
        }
        cleaned_students.append(cleaned_student)
    
    return cleaned_students


def parse_results_excel(file_path: str) -> List[Dict]:
    """
    Parse Excel file with results
    Expected columns: reg_no, course_code, score, grade
    """
    df = pd.read_excel(file_path)
    
    # Validate required columns
    required_columns = ['reg_no', 'course_code', 'score', 'grade']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
    
    # Convert to list of dicts
    results = df.to_dict('records')
    
    # Clean and validate data
    cleaned_results = []
    for result in results:
        if pd.isna(result['reg_no']) or pd.isna(result['course_code']):
            continue
        
        cleaned_result = {
            'reg_no': str(result['reg_no']).strip(),
            'course_code': str(result['course_code']).strip().upper(),
            'score': float(result['score']),
            'grade': str(result['grade']).strip().upper(),
        }
        cleaned_results.append(cleaned_result)
    
    return cleaned_results