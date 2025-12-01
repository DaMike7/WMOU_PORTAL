import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings 

class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.WMOuBlue = '#1e3a5f'

    # --- New Branded Template (Task 6) ---
    def get_branded_template(self, subject: str, body_content: str):
        """Generates the modern, branded HTML template."""
        current_year = datetime.now().year
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.15);">
                    
                    <div style="background-color: {self.WMOuBlue}; padding: 25px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">WMOU Portal</h1>
                    </div>
                    
                    <div style="padding: 30px 40px; color: #333333; line-height: 1.7;">
                        <h2 style="color: {self.WMOuBlue}; margin-top: 0; font-size: 20px;">{subject}</h2>
                        {body_content}
                        <p style="margin-top: 30px;">Best regards,<br>
                        <strong style="color: {self.WMOuBlue};">WMOU Administration Team</strong></p>
                    </div>
                    
                    <div style="background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 15px; text-align: center; color: #888888; font-size: 12px;">
                        &copy; {current_year} WMOU Portal. All rights reserved.
                    </div>
                </div>
            </body>
        </html>
        """

    def send_email(self, to_email: str, subject: str, body_html: str):
        """Send email notification using the standard SMTP mechanism."""
        if not self.smtp_user or not self.smtp_password:
            print("Email not configured. Skipping email send.")
            return
        
        msg = MIMEMultipart()
        msg['From'] = self.smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach the full branded HTML body
        full_body = self.get_branded_template(subject, body_html)
        msg.attach(MIMEText(full_body, 'html'))
        
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                print(f"Email sent successfully to {to_email} for subject: '{subject}'")
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")


    # --- New Method for User Creation (Task 7) ---
    def send_user_welcome(self, student_email: str, full_name: str, reg_no: str, password: str):
        """Sends welcome email with registration details (Task 7)"""
        subject = "Welcome to WMOU Portal! Your Account Details"
        body_content = f"""
        <p>Dear <strong>{full_name}</strong>,</p>
        <p>Your WMOU Portal account has been successfully created by the administrator.</p>
        <p>Please use the details below to log in:</p>
        
        <div style="background-color: #e6f7ff; border: 1px solid #b3e0ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Registration Number:</strong> <span style="font-weight: bold; color: {self.WMOuBlue};">{reg_no}</span></p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Temporary Password:</strong> <span style="font-weight: bold; color: #d9534f;">{password}</span></p>
        </div>
        
        <p style="font-style: italic; color: #666;">
            We highly recommend you change your password immediately upon first login.
        </p>
        """
        self.send_email(student_email, subject, body_content)


    # --- Updated Payment Methods (Task 6) ---

    def send_payment_confirmation(self, student_email: str, course_name: str):
        """Send payment confirmation email for pending approval."""
        subject = "Payment Received - Under Review"
        body_content = f"""
        <p>Dear Student,</p>
        <p>We have successfully received your payment proof for: <strong>{course_name}</strong>.</p>
        <p>Your submission is currently under review by our administration team. We will notify you via email as soon as a decision (Approval or Rejection) is made, typically within 24 hours.</p>
        <p>Thank you for your patience.</p>
        """
        self.send_email(student_email, subject, body_content)
    
    def send_payment_approval(self, student_email: str, course_name: str, approved: bool, rejection_reason: str = None):
        """Send payment approval/rejection email."""
        if approved:
            subject = "Payment Approved! 🎉"
            color = "#22c55e" # Green
            body_content = f"""
            <p>Dear Student,</p>
            <p>We are pleased to inform you that your payment for <strong>{course_name}</strong> has been officially <strong style="color: {color};">APPROVED</strong>.</p>
            <p>Your registration for this course is now complete, and you can access all associated course materials and resources on the portal.</p>
            """
        else:
            subject = "Payment Rejected ⚠️"
            color = "#ef4444" # Red
            body_content = f"""
            <p>Dear Student,</p>
            <p>We regret to inform you that your payment for <strong>{course_name}</strong> has been <strong style="color: {color};">REJECTED</strong>.</p>
            """
            if rejection_reason:
                body_content += f"""
                <p><strong>Reason for Rejection:</strong></p>
                <div style="background-color: #fee2e2; border-left: 5px solid {color}; padding: 15px; margin: 15px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #7f1d1d;">{rejection_reason}</p>
                </div>
                """
            body_content += "<p>Please contact the admin or resubmit a clearer/corrected proof of payment.</p>"
            
        self.send_email(student_email, subject, body_content)