import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / 'app.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY") # "your-google-maps-api-key"
    


class DevelopmentConfig(Config):
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")


class ProductionConfig(Config):
    SECRET_KEY = os.environ.get("SECRET_KEY")