from flask import render_template
from flask_security import Security, SQLAlchemyUserDatastore, login_required
from flask_security.forms import RegisterForm, Required, StringField

from application import app, db
from application.models import User, Role


class ExtendedRegisterForm(RegisterForm):
    name = StringField('Name', [Required()])


user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore, register_form=ExtendedRegisterForm)


@app.route('/')
@login_required
def flashcardapp():
    return render_template("index.html")
