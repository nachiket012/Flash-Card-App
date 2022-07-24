from flask_security import UserMixin, RoleMixin

from application import db

# Define models
roles_users = db.Table('roles_users',
                       db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
                       db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    name = db.Column(db.String(50))
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))


class Deck(db.Model):
    __tablename__ = 'deck'
    id = db.Column(db.Integer, primary_key=True)
    deck_name = db.Column(db.String(30))
    user_id = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, default=0)
    last_rev = db.Column(db.DateTime(timezone=True), nullable=True)
    created = db.Column(db.DateTime(timezone=True), nullable=True)
    dcard = db.relationship('Card', cascade='all, delete-orphan', backref='card')

    def __init__(self, name, u_id, created):
        self.deck_name = name
        self.user_id = u_id
        self.created = created


class Card(db.Model):
    __tablename__ = 'card'
    card_id = db.Column(db.Integer, primary_key=True)
    front = db.Column(db.String(512), nullable=False)
    back = db.Column(db.String(512), nullable=False)
    deck_id = db.Column(db.String, db.ForeignKey('deck.id'), nullable=False)

    def __init__(self, front, back, d_id):
        self.front = front
        self.back = back
        self.deck_id = d_id
