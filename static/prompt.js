const promptForm = document.getElementById("prompt-form");
const submitButton = document.getElementById("submit-button");
const questionButton = document.getElementById("question-button");
const messagesContainer = document.getElementById("messages-container");
const qcmContainer = document.getElementById("qcm-container");
const qcmQuestion = document.getElementById("qcm-question");
const qcmChoices = document.getElementById("qcm-choices");
const qcmSubmit = document.getElementById("qcm-submit");
const qcmFeedback = document.getElementById("qcm-feedback");

const appendHumanMessage = (message) => {
    const humanMessageElement = document.createElement("div");
    humanMessageElement.classList.add("message", "message-human");
    humanMessageElement.innerHTML = message;
    messagesContainer.appendChild(humanMessageElement);
};

const appendAIMessage = async (messagePromise) => {
    const loaderElement = document.createElement("div");
    loaderElement.classList.add("message");
    loaderElement.innerHTML =
        "<div class='loader'><div></div><div></div><div></div>";
    messagesContainer.appendChild(loaderElement);

    try {
        const messageToAppend = await messagePromise();
        loaderElement.innerHTML = messageToAppend;
    } catch (error) {
        loaderElement.innerHTML = "Une erreur est survenue.";
        console.error(error);
    }
};

const handlePrompt = async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    promptForm.reset();

    let url = "/prompt";
    if (questionButton.dataset.question !== undefined) {
        url = "/answer";
        data.append("question", questionButton.dataset.question);
        delete questionButton.dataset.question;
        questionButton.classList.remove("hidden");
        submitButton.innerHTML = "Message";
    }

    appendHumanMessage(data.get("prompt"));

    await appendAIMessage(async () => {
        const response = await fetch(url, {
            method: "POST",
            body: data,
        });
        const result = await response.json();
        return result.answer;
    });
};

promptForm.addEventListener("submit", handlePrompt);

const handleQuestionClick = async () => {
    await appendAIMessage(async () => {
        const response = await fetch("/question", { method: "GET" });
        const result = await response.json();
        questionButton.dataset.question = result.answer;
        questionButton.classList.add("hidden");
        submitButton.innerHTML = "Répondre à la question";
        return result.answer;
    });

};

questionButton.addEventListener("click", handleQuestionClick);

///////////////// QCM

const handleQCMClick = async () => {
    const response = await fetch("/qcm", { method: "GET" });
    const result = await response.json();
    const data = result.answer;
    displayQCM(data);
};


const qcmTestButton = document.getElementById("qcm-test-button");

qcmTestButton.addEventListener("click", handleQCMClick);

function displayQCM(data) {     //data doit être un dictionnaire

    const { answer, choices, correct } = data;
    const newQCMButton = document.getElementById("new-qcm-button");

    // Créez une nouvelle div pour le QCM
    const qcmDiv = document.createElement("div");
    qcmDiv.classList.add("qcm-div");

    // Ajoutez la question au nouveau div
    const questionDiv = document.createElement("div");
    questionDiv.innerHTML = answer;
    qcmDiv.appendChild(questionDiv);

    // Ajoutez les choix au nouveau div
    const choicesList = document.createElement("ul");

    choices.forEach((choice, index) => {
        const li = document.createElement("li");
        const radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "qcm-choice";
        radioButton.value = index;
        const label = document.createElement("label");
        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(choice));
        li.appendChild(label);
        choicesList.appendChild(li);
    });

    qcmDiv.appendChild(choicesList);

    // Ajoutez le nouveau div au conteneur de messages
    messagesContainer.appendChild(qcmDiv);

    // Ajoutez les fonctions de validation et autres interactions ici, similaires à celles de votre fonction actuelle.
    qcmSubmit.onclick = function () {
        // ... (même code que précédemment)
    };

    newQCMButton.addEventListener("click", handleQCMClick);
}



function displayQCM(data) {     //data doit être un dictionnaire

    const { answer, choices, correct } = data;
    const newQCMButton = document.getElementById("new-qcm-button");

    qcmQuestion.innerHTML = answer;
    qcmChoices.innerHTML = "";
    qcmFeedback.innerHTML = ""; // Réinitialise le feedback

    choices.forEach((choice, index) => {
        const li = document.createElement("li");
        const radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "qcm-choice";
        radioButton.value = index;
        const label = document.createElement("label");
        label.appendChild(radioButton);
        label.appendChild(document.createTextNode(choice));
        li.appendChild(label);
        qcmChoices.appendChild(li);
    });

    qcmContainer.classList.remove("hidden");

    qcmSubmit.onclick = function () {
        const selected = document.querySelector("input[name='qcm-choice']:checked");
        if (selected) {
            if (parseInt(selected.value) === correct) {
                qcmFeedback.innerHTML = "Bonne réponse !";
                qcmFeedback.style.color = "green";
                newQCMButton.classList.remove("hidden");  // Affiche le bouton
            } else {
                qcmFeedback.innerHTML = "Réponse incorrecte. Réessayez.";
                qcmFeedback.style.color = "red";
                newQCMButton.classList.add("hidden");  // Cache le bouton
            }
        } else {
            qcmFeedback.innerHTML = "Veuillez sélectionner une réponse.";
            qcmFeedback.style.color = "orange";
            newQCMButton.classList.add("hidden");  // Cache le bouton
        }
    };

    newQCMButton.addEventListener("click", handleQCMClick);


}

