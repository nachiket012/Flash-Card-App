import random
from datetime import datetime

import flask_login
from dateutil.relativedelta import relativedelta

from application import cache
from application import db
from application.models import User, Deck, Card


@cache.cached(timeout=60)
def get_all_decks():
    decks = []
    data = db.session.query(Deck).filter(Deck.user_id == flask_login.current_user.id).all()
    for item in data:
        decks.append({
            "id": item.id,
            "deck_name": item.deck_name,
            "user_id": item.user_id,
            "score": item.score,
            "created": str(item.created),
            "last_rev": str(item.last_rev)
        })
    return decks

@cache.cached(timeout=60)
def get_all_cards(name):
    cards = []
    d_id = int(name[5])
    data = db.session.query(Card).filter(Card.deck_id == d_id).all()
    if "play" in name:
        random.shuffle(data)
    for item in data:
        cards.append({
            "card_id": item.card_id,
            "front": item.front,
            "back": item.back,
            "deck_id": item.deck_id,
        })
    return cards


@cache.cached(timeout=60)
def get_all_users():
    users = []
    data = db.session.query(User).all()
    for item in data:
        users.append({
            "id": item.id,
            "name": item.name,
            "email": item.email,
            "password": item.password,
            "active": item.active,
            "confirmed_at": item.confirmed_at
        })
    return users
  
@cache.cached()  
def deck_info(user):
    decks = []
    data = db.session.query(Deck).filter(Deck.user_id == user["id"]).all()
    for item in data:
        decks.append({
            "id": item.id,
            "deck_name": item.deck_name,
            "user_id": item.user_id,
            "score": item.score,
            "created": str(item.created),
            "last_rev": str(item.last_rev)
        })
    
    newdecks = []
    for deck in decks:
        if datetime.strptime(deck["created"], "%Y-%m-%d %H:%M:%S") + relativedelta(months=1) > datetime.now():
            newdecks.append(deck)
    return decks, newdecks
