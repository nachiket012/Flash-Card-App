# Flashcard App v2



Flashcard App v2 is a web application which you can use to create, edit and review your flashcards. 


# How to run:
- Ensure you have redis installed and running on default port
- Create and activate virtual environment:
 ```sh
python -m venv venv
source venv/Scripts/activate
```
- Install site packages:
 ```sh
pip install -r requirments.txt
```
- Run main.py:
```sh
python main.py
```
- In a different terminal start celery workers
 ```sh
sh workers.sh
```
- In a different terminal start celery beats
 ```sh
sh beats.sh
```

Finally go to `localhost:8500` in your browser to start the app