export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
};

export const SEMESTERS = [
  { value: 'First Semester', label: 'First Semester' },
  { value: 'Second Semester', label: 'Second Semester' },
];

export const SESSIONS = [
  '2025/2026',
  '2026/2027',
  '2027/2028',
  '2028/2029',
];

export const DEPARTMENTS = [
  'Cyber Security',
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
];

export const WHATSAPP_MESSAGE = 'Hello, I need assistance with logging into the student portal.\nI dont have an account yet.';

export const WHATSAPP_LINK = `https://wa.me/${VITE_ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;