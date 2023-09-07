from flask import Flask, render_template, request
from src.utils.ask_question_to_pdf import ask_question_to_pdf, ask_qcm

app = Flask(__name__)

remember_question = ""


@app.route("/")
def template():
    return render_template("index.html")


@app.route("/prompt", methods=["POST"])
def prompt():
    reponse = ask_question_to_pdf(request.form["prompt"])
    return {"answer": reponse}


@app.route("/question", methods=["GET"])
def pose_question():
    remember_question = ask_question_to_pdf("Pose moi une question sur le cours")
    return {"answer": remember_question}


@app.route("/answer", methods=["POST"])
def reponse_question():
    reponse = ask_question_to_pdf(
        "Ma réponse à ta question est : "
        + request.form["prompt"]
        + ". Dis-moi si la réponse est juste. Si ma réponse est fausse, explique de manière pédagogue quelle est la bonne réponse.",
        remember_question,
    )
    return {"answer": reponse}


@app.route("/qcm", methods=["GET"])
def pose_qcm():
    reponse = ask_qcm()
    return {"answer": reponse}
