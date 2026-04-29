from flask import Flask

from app.routes import main_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = "dev-secret-key"
    app.register_blueprint(main_bp)
    return app
