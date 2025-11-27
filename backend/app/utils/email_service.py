import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
    
    def send_email(self, to_email: str, subject: str, body: str):
        """Send email notification"""
        if not self.smtp_user or not self.smtp_password:
            print("Email not configured")
            return
        
        msg = MIMEMultipart()
        msg['From'] = self.smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                print(f"Email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
    
    def send_payment_confirmation(self, student_email: str, course_name: str):
        """Send payment confirmation email"""
        subject = "Payment Received - Pending Approval"
        body = f"""
        <html>
            <body>
                <h2>Payment Receipt Uploaded</h2>
                <p>Dear Student,</p>
                <p>We have received your payment proof for <strong>{course_name}</strong>.</p>
                <p>Your payment is currently under review and will be processed within 24-48 hours.</p>
                <p>You will be notified once your payment is approved.</p>
                <br>
                <p>Best regards,<br>School Administration</p>
            </body>
        </html>
        """
        self.send_email(student_email, subject, body)
    
    def send_payment_approval(self, student_email: str, course_name: str, approved: bool):
        """Send payment approval/rejection email"""
        if approved:
            subject = "Payment Approved"
            body = f"""
            <html>
                <body>
                    <h2>Payment Approved</h2>
                    <p>Dear Student,</p>
                    <p>Your payment for <strong>{course_name}</strong> has been approved.</p>
                    <p>You can now access course materials and other resources.</p>
                    <br>
                    <p>Best regards,<br>School Administration</p>
                </body>
            </html>
            """
        else:
            subject = "Payment Rejected"
            body = f"""
            <html>
                <body>
                    <h2>Payment Rejected</h2>
                    <p>Dear Student,</p>
                    <p>Unfortunately, your payment for <strong>{course_name}</strong> has been rejected.</p>
                    <p>Please contact the admin or resubmit with correct payment proof.</p>
                    <br>
                    <p>Best regards,<br>School Administration</p>
                </body>
            </html>
            """
        self.send_email(student_email, subject, body)