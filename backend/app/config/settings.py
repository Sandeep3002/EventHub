import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)

    PROJECT_NAME: str = "EventHub API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production-eventhub-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "eventhub_db")

    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_REPLACE_ME")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "REPLACE_ME")

    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "contact.gvmsc@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "rhit hnoz jcjk ajzt")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "contact.gvmsc@gmail.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "EventHub")

settings = Settings()
