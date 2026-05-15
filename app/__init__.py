import os
from flask import Flask

from app.config import DevelopmentConfig, ProductionConfig
from app.extensions import db, migrate, csrf, login
from app.forms import LogoutForm
from app.routes import main_bp


def create_app() -> Flask:
    app = Flask(__name__)

    if os.environ.get("FLASK_ENV") == "production":
        app.config.from_object(ProductionConfig)

        if not app.config.get("SECRET_KEY"):
            raise RuntimeError("SECRET_KEY environment variable is not set")
    else:
        app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login.init_app(app)
    login.login_view = "main.signin"

    from app import models

    app.register_blueprint(main_bp)

    @app.context_processor
    def inject_template_vars():
        return {
            "logout_form": LogoutForm(),
            "google_maps_api_key": app.config.get("GOOGLE_MAPS_API_KEY"),
        }
    
    return app