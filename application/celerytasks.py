import csv
import json
import random

import requests
from celery.schedules import crontab
from flask import render_template
from flask_mail import Message

from application import celery, mail, db
from application.common_functions import get_all_users, deck_info
from application.models import Deck, Card


@celery.on_after_finalize.connect
def periodic_task_scheduler(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=19, minute=00),
        dailyreminder.s()
    )

    sender.add_periodic_task(
        crontab(0, 0, day_of_month='1'),
        monthlyreport.s()
    )

@celery.task()
def dailyreminder():
    url = "https://chat.googleapis.com/v1/spaces/AAAAcYukjOw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=svhJUnN2sTSSJVTb6ODPCYn121cZKi8jdUH0hq4-6yw%3D"
    body = {"text": "Hello! This is your daily reminder to review your flashcards."}
    r = requests.post(url=url, data=json.dumps(body))
    print(r.json())

@celery.task()
def monthlyreport():
    userlist = get_all_users()
    for user in userlist:
        job = send_monthlyreport.delay(user)
        
        
        
@celery.task()
def send_monthlyreport(user):
    decks, newdecks = deck_info(user)
    msg = Message()
    msg.add_recipient(user["email"])
    msg.subject = "Flashcard App - Monthly Status Report"
    msg.html = render_template('report.html', user = user, decks = decks, newdecks = newdecks)
    mail.send(msg)
    return "Mailed " + user["name"]
    
    
@celery.task()
def deck_export(name):
    cards = []
    d_id = int(name[6])
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
    keys = cards[0].keys()
    filename = db.session.query(Deck.deck_name).filter(Deck.id == d_id).scalar()
    with open('./application/Export/' + filename + '.csv', 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(cards)
    return filename