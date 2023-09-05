from flask import Flask, render_template, request
from src.utils.ask_question_to_pdf import ask_question_to_pdf

app = Flask(__name__)

@app.route("/")
def template():
    return render_template('index.html')

@app.route("/prompt", methods=['POST'])
def prompt():
    reponse = ask_question_to_pdf(request.form["prompt"])
    if reponse==None:
        return {"answer":"Rien"}
    return {"answer":reponse}
