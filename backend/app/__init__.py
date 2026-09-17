from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, cors, mail

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    mail.init_app(app)

    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp)

    return app