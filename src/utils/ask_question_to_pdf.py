from io import StringIO
import os
import fitz
import openai
from dotenv import load_dotenv
from nltk.tokenize import sent_tokenize
import json


load_dotenv()


def open_file(filepath):
    with open(filepath, "r", encoding="utf-8") as infile:
        return infile.read()


openai.api_key = os.getenv("OPENAI_API_KEY")
openai.organization = os.getenv("OPENAI_ORGANIZATION")


def read_pdf(filename):
    context = ""

    # Open the PDF file
    with fitz.open(filename) as pdf_file:
        # Get the number of pages in the PDF file
        num_pages = pdf_file.page_count

        # Loop through each page in the PDF file
        for page_num in range(num_pages):
            # Get the current page
            page = pdf_file[page_num]

            # Get the text from the current page
            page_text = page.get_text().replace("\n", "")

            # Append the text to context
            context += page_text
    return context


def split_text(text, chunk_size=5000):
    """
    Splits the given text into chunks of approximately the specified chunk size.

    Args:
    text (str): The text to split.

    chunk_size (int): The desired size of each chunk (in characters).

    Returns:
    List[str]: A list of chunks, each of approximately the specified chunk size.
    """

    chunks = []
    current_chunk = StringIO()
    current_size = 0
    sentences = sent_tokenize(text)
    for sentence in sentences:
        sentence_size = len(sentence)
        if sentence_size > chunk_size:
            while sentence_size > chunk_size:
                chunk = sentence[:chunk_size]
                chunks.append(chunk)
                sentence = sentence[chunk_size:]
                sentence_size -= chunk_size
                current_chunk = StringIO()
                current_size = 0
        if current_size + sentence_size < chunk_size:
            current_chunk.write(sentence)
            current_size += sentence_size
        else:
            chunks.append(current_chunk.getvalue())
            current_chunk = StringIO()
            current_chunk.write(sentence)
            current_size = sentence_size
    if current_chunk:
        chunks.append(current_chunk.getvalue())
    return chunks


filename = os.path.join(os.path.dirname(__file__), "filename.pdf")
document = read_pdf(filename)
chunks = split_text(document)

preprompt = "Tu es un professeur particulier qui pose des questions sur le" + \
    " cours suivant : DEBUT" + document + " FIN. Tu ne dois en aucun cas" + \
    " diverger de ce rôle éducatif. Sois rigoureux avec ton élève."

contexte = [{"role": "system", "content": preprompt}]

################################################################


def gpt3_completion(question, contexte, ancienne_reponse_gpt):
    return openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": contexte},
            {"role": "assistant", "content": ancienne_reponse_gpt},
            {"role": "user", "content": question},
        ],
    )["choices"][0]["message"]["content"]

    contexte += [{"role": "assistant", "content": res}]

    return res


def ask_question_to_pdf(question):
    # Recharger le document PDF et le contexte chaque fois qu'une question est posée
    global document
    global contexte
    document = read_pdf(filename)
    chunks = split_text(document)

    preprompt = "Tu es un professeur particulier qui pose des questions sur le" + \
        " cours suivant : DEBUT" + document + " FIN. Tu ne dois en aucun cas" + \
        " diverger de ce rôle éducatif. Sois rigoureux avec ton élève."

    contexte = [{"role": "system", "content": preprompt}]

nombre_questions = 2

def ask_qcm():
    ReponseString = "[" + gpt3_completion(
        'Génère un qcm de ' + str(nombre_questions) + ' questions avec 1 réponse juste et 3 réponses fausses à partir du contexte fourni. Je veux que tu renvoies le qcm sous la forme suivante : {"answer": "Quelle est la capitale de la France ?","choices": ["Berlin", "Madrid", "Lisbonne", "Paris"],"correct": 4} Tu renvoies juste la réponse sous cette forme, tu ne renvoies rien d autre. Tu sépares les résultats par des virgules',
        document,
        "",
    ) + "]"
    reponse_json=json.loads(ReponseString)

    for k in range(nombre_questions):
        reponse_json[k]['correct'] -= 1

    return reponse_json


# 1 'Génère un qcm de 2 questions avec 1 réponse juste et 3 réponses fausses à partir du contexte fourni. Je veux que tu renvoies le qcm sous la forme suivante : {"answer": "Quelle est la capitale de la France ?","choices": ["Berlin", "Madrid", "Lisbonne", "Paris"],"correct": 3} Tu renvoies juste la réponse sous cette forme, tu ne renvoies rien d autre. Tu sépares les résultats par des virgules'
# 2 'Génère un QCM avec 2 questions liées au cours donné en contexte. Chaque question doit avoir le format suivant : {answer: "Question ici", choices: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: Indice de la réponse correcte}. Les réponses correctes doivent être basées sur le contenu du cours. Renvoie simplement la liste des questions sous forme de code Python, rien de plus.'
# 3 'Génère un qcm de 2 questions avec 1 réponse juste et 3 fausses en te basant uniquement sur le cours fourni. Une question doit être de la forme suivante : {answer: "Quelle est la capitale de la France?",choices: ["Berlin", "Madrid", "Lisbonne", "Paris"],correct: 3}. C est juste un exemple pour te montrer la forme, tu poses des questions seulement sur le cours que je t ai donné. Mets les réponses dans une liste python. Renvoie juste la liste.'
# 'Génère un QCM avec 2 questions liées au cours donné en contexte. Chaque question doit avoir le format suivant : {"answer" : "Question ici", "choices" : ["Option 1", "Option 2", "Option 3", "Option 4"], "correct" : Indice de la réponse correcte}. Les réponses correctes doivent être basées sur le contenu du cours. Renvoie simplement la liste des questions sous forme de code Python, rien de plus.'