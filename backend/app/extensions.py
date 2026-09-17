from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from itsdangerous import URLSafeTimedSerializer

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mail = Mail()

def get_serializer(app):
    return URLSafeTimedSerializer(app.config['SECRET_KEY'])