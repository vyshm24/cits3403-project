"""
Flask application configuration
"""
import os

class Config:
    """Base configuration"""
    # Flask settings
    FLASK_ENV = 'development'
    DEBUG = True
    
    # Template settings
    TEMPLATE_AUTO_RELOAD = True
    
    # Static files
    SEND_FILE_MAX_AGE_DEFAULT = 0  # Disable caching in development
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    TEMPLATE_FOLDER = os.path.join(BASE_DIR, 'pages')
    STATIC_FOLDER = BASE_DIR

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
