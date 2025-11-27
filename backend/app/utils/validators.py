import re

def validate_reg_no(reg_no: str) -> bool:
    pattern = r'^[A-Z0-9]{6,10}$'
    return bool(re.match(pattern, reg_no.upper()))

def validate_phone(phone: str) -> bool:
    """Validate phone number"""
    # Basic validation for Nigerian phone numbers
    pattern = r'^(\+234|0)[789]\d{9}$'
    return bool(re.match(pattern, phone))

def calculate_grade(score: float) -> str:
    """Calculate grade from score"""
    if score >= 70:
        return 'A'
    elif score >= 60:
        return 'B'
    elif score >= 50:
        return 'C'
    elif score >= 45:
        return 'D'
    elif score >= 40:
        return 'E'
    else:
        return 'F'