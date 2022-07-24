import os

from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_caching import Cache
from celery import Celery

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///mydb.sqlite3"

app.config['SECRET_KEY'] = 'super-secret'
app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_PASSWORD_SALT'] = 'yOr04oAPMwFcLXBU3tX4SjFxXIxm8yFW4EZ7zpBF8ZP2WXJoUsJnPobuEKRX2NZOH1jypQVdtT66ewpi'
app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
app.config['SECURITY_POST_LOGIN_VIEW'] = '/'
app.config['SECURITY_POST_REGISTER_VIEW'] = '/login'

app.config["CELERY_BROKER_URL"] = "redis://localhost:6379/1"
app.config["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/2"

app.config["MAIL_DEFAULT_SENDER"] = "email@flashcard.com"
app.config['MAIL_SERVER'] = 'smtp.mailtrap.io'
app.config['MAIL_PORT'] = 2525
app.config['MAIL_USERNAME'] = 'eae8829a9e9e74'
app.config['MAIL_PASSWORD'] = '759eb52a4b4e80'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_HOST"] = "localhost"
app.config["CACHE_REDIS_PORT"] = 6379

db = SQLAlchemy(app)
app.app_context().push()
myapi = Api(app)
app.app_context().push()

mail = Mail(app)
app.app_context().push()
cache = Cache(app)
app.app_context().push()

celery = Celery("Application Jobs", )


class ContextTask(celery.Task):
    def __call__(self, *args, **kwargs):
        with app.app_context():
            return self.run(*args, **kwargs)


celery.conf.update(
    broker_url=app.config["CELERY_BROKER_URL"],
    result_backend=app.config["CELERY_RESULT_BACKEND"]
)

from application import controllers, api
