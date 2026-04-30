from flask import Flask

from app.config import Config
from app.extensions import db
from app.routes import main_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        from app import models
        db.create_all()

    app.register_blueprint(main_bp)
    return app
