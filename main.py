from flask import Flask, render_template, request
from src.utils.ask_question_to_pdf import ask_question_to_pdf

app = Flask(__name__)

@app.route("/")
def template():
    return render_template('index.html')

@app.route("/prompt", methods=['POST'])
def prompt():
    reponse = ask_question_to_pdf(request.form["prompt"])
    return {"answer":reponse}

@app.route("/question", methods=['GET'])
def pose_question():
    reponse = ask_question_to_pdf("Pose moi une question sur le cours")
    return {"answer":reponse}
