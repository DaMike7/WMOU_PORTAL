from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str

    #cloudfare
    cloudflare_site_key: str
    cloudflare_secret_key: str
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_days: int = 7
    
    # Cloudinary
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    
    # Email (Optional)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    
    # Application
    app_name: str = "School Portal"
    default_password: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()