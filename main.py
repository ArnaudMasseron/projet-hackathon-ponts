from flask import Flask, render_template, request
from src.utils.ask_question_to_pdf import ask_question_to_pdf
from src.utils.ask_question_to_pdf import contexte

app = Flask(__name__)

remember_question = ""


@app.route("/")
def template():
    return render_template('index.html')


@app.route("/prompt", methods=['POST'])
def prompt():
    reponse = ask_question_to_pdf(request.form["prompt"])
    return {"answer": reponse}


@app.route("/question", methods=['GET'])
def pose_question():
    return {"answer": ask_question_to_pdf("Pose moi une question sur un détail du cours")}


@app.route("/answer", methods=['POST'])
def reponse_question():
    reponse = ask_question_to_pdf("Ma réponse est : " +
                                  request.form["prompt"] +
                                  ". Dis si elle est juste et le cas échéant" +
                                  " donne la réponse en pas plus de 3 phrases.")
    return {"answer": reponse}
