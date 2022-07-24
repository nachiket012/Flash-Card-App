import datetime

import flask_login
from flask import render_template, send_from_directory
from flask_mail import Message
from flask_restful import Resource, reqparse
from flask_security import login_required
from sqlalchemy import func

from application import db, myapi, mail, celerytasks
from application.common_functions import get_all_users, get_all_decks, get_all_cards
from application.models import Card, Deck


class BasicGET(Resource):
    @login_required
    def get(self, name):
        if name == "users":
            return get_all_users()

        elif name == "decks":
            return get_all_decks()

        elif name.startswith("cards"):
            return get_all_cards(name)
        
        elif name.startswith("export"):
            exportjob = celerytasks.deck_export.delay(name)
            filename = exportjob.wait()
            return send_from_directory("Export", filename + '.csv', as_attachment=True)
        else:
            return {"error": "bad request"}, 400
            

    @login_required
    def put(self, name):

        update_deck = reqparse.RequestParser()
        update_deck.add_argument("deck_id", type=int)
        update_deck.add_argument("score", type=float, required=False)
        update_deck.add_argument("name", type=str)

        update_card = reqparse.RequestParser()
        update_card.add_argument("c_id", type=int)
        update_card.add_argument("front", type=str)
        update_card.add_argument("back", type=str)

        if name == "decks":
            args = update_deck.parse_args()
            score = args["score"]
            name = args["name"]
            d = Deck.query.filter_by(id=args["deck_id"]).first()
            if args["score"]:
                d.score = round(score, 2)
                d.last_rev = datetime.datetime.strptime((datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")), '%Y-%m-%d %H:%M:%S')
            if args["name"]:
                d.deck_name = name
            db.session.commit()
            return {
                "put": "deck",
                "id": args["deck_id"],
                "name": args["name"]
            }

        elif name.startswith("cards"):
            
            args = update_card.parse_args()
            card = Card.query.filter_by(card_id=args["c_id"]).first()
            card.front = args["front"]
            card.back = args["back"]
            db.session.commit()
            return {
                "put": "card",
                "id": args["c_id"],
                "front": args["front"],
                "back": args["back"]
            }
        else:
            return {"error": "bad request"}, 400

    @login_required
    def post(self, name):
        create_deck = reqparse.RequestParser()
        create_deck.add_argument("deck_name", type=str)

        create_card = reqparse.RequestParser()
        create_card.add_argument("deck_id", type=int)
        create_card.add_argument("front", type=str)
        create_card.add_argument("back", type=str)

        if name == "decks":
            args = create_deck.parse_args()
            deck = Deck(args["deck_name"], flask_login.current_user.id, datetime.datetime.strptime((datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")), '%Y-%m-%d %H:%M:%S'))
            db.session.add(deck)
            db.session.commit()
            return {
                "post": "deck",
                "id": db.session.query(func.max(Deck.id)).scalar(),
                "user_id": flask_login.current_user.id,
            }

        elif name.startswith("cards"):
            
            args = create_card.parse_args()
            card = Card(args["front"], args["back"], args["deck_id"])
            db.session.add(card)
            db.session.commit()
            return {
                "post": "card",
                "id": db.session.query(func.max(Card.card_id)).scalar(),
                "user_id": flask_login.current_user.id
            }
        else:
            return {"error": "bad request"}, 400
            

    @login_required
    def delete(self, name):
        
        delete = reqparse.RequestParser()
        delete.add_argument("id")
        args = delete.parse_args()
        
        if name == "decks":          
            deck = Deck.query.filter_by(id=args["id"]).first()
            db.session.delete(deck)
            db.session.commit()
            return {
                "delete": "deck",
                "id": args["id"]
            }

        elif name.startswith("cards"):
            
            args = delete.parse_args()
            card = Card.query.filter_by(card_id=args["id"]).first()
            db.session.delete(card)
            db.session.commit()
            return {
                "delete": "card",
                "id": args["id"]
            }
        else:
            return {"error": "bad request"}, 400
            


myapi.add_resource(BasicGET, "/api/<string:name>")
