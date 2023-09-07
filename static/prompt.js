const promptForm = document.getElementById("prompt-form");
const submitButton = document.getElementById("submit-button");
const questionButton = document.getElementById("question-button");
const darkmodeButton = document.getElementById("darkmode-button");
const messagesContainer = document.getElementById("messages-container");
const qcmContainer = document.getElementById("qcm-container");
const qcmQuestion = document.getElementById("qcm-question");
const qcmChoices = document.getElementById("qcm-choices");
const qcmSubmit = document.getElementById("qcm-submit");
const qcmFeedback = document.getElementById("qcm-feedback");
const endQCMButton = document.getElementById("end-qcm-button");
const returnChatButton = document.getElementById("return-chat-button");
const qcmForm = document.getElementById("qcm-form");
const newQCMTestButton = document.getElementById("new-qcm-test-button");

var body = document.getElementsByTagName('body')[0];
var darkmode = false;
var matin = new Date(2023, 0, 0, 15, 3, 0);
var soir = new Date(2023, 0, 0, 15, 6, 0);

qcmForm.style.display = "none";

const appendHumanMessage = (message) => {
    const humanMessageElement = document.createElement("div");
    humanMessageElement.classList.add("message", "message-human");
    humanMessageElement.innerHTML = message;
    messagesContainer.appendChild(humanMessageElement);
};

const appendSimpleAIMessage = (message) => {
    const humanMessageElement = document.createElement("div");
    humanMessageElement.classList.add("message");
    humanMessageElement.innerHTML = message;
    messagesContainer.appendChild(humanMessageElement);
};

const appendAIMessage = async (messagePromise) => {
    // Add a loader to the interface
    const loaderElement = document.createElement("div");
    loaderElement.classList.add("message");
    loaderElement.innerHTML =
        "<div class='loader'><div></div><div></div><div></div>";
    messagesContainer.appendChild(loaderElement);

    // Await the answer from the server
    const messageToAppend = await messagePromise();

    // Replace the loader with the answer
    loaderElement.classList.remove("loader");
    loaderElement.innerHTML = messageToAppend;
};

const handlePrompt = async (event) => {
    event.preventDefault();
    // Parse form data in a structured object
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

const handleQuestionClick = async (event) => {
    appendAIMessage(async () => {
        const response = await fetch("/question", {
            method: "GET",
        });
        const result = await response.json();
        const question = result.answer;

        questionButton.dataset.question = question;
        questionButton.classList.add("hidden");
        submitButton.innerHTML = "Répondre à la question";
        return question;
    });
};

questionButton.addEventListener("click", handleQuestionClick);

// DARK MODE

function toggleDarkmode() {
    darkmode = !darkmode;
    if (darkmode) {
        document.body.classList.add("dark");
        darkmodeButton.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        darkmodeButton.textContent = "🌙";
    }
}

const handleDarkmodeClick = async (event) => {
    toggleDarkmode();
}

darkmodeButton.addEventListener("click", handleDarkmodeClick);

const appendAIMessageDirectly = (message) => {
    const aiMessageElement = document.createElement("div");
    aiMessageElement.classList.add("message", "message-human");
    aiMessageElement.innerHTML = message;
    messagesContainer.appendChild(aiMessageElement);
};

const checkTimeForDarkmode = async () => {
    var now = new Date();
    var thisMorning = new Date();
    var tonight = new Date();
    thisMorning.setHours(matin.getHours());
    thisMorning.setMinutes(matin.getMinutes());
    tonight.setHours(soir.getHours());
    tonight.setMinutes(soir.getMinutes());
    if (now >= thisMorning && now < tonight) {
        // Cas "jour"
        if (darkmode) {
            toggleDarkmode();
        }
        setTimeout(checkTimeForDarkmode, tonight.getTime() - now.getTime() + 1000);

    }
    else if (now < thisMorning || now >= tonight) {
        // Cas "nuit"
        if (!darkmode) {
            toggleDarkmode();
        }
        setTimeout(checkTimeForDarkmode, thisMorning.getTime() - now.getTime() + (now > thisMorning) * (86400 * 1000 + 1000));
    }
}

checkTimeForDarkmode();


/////// PDF

const fileUploadForm = document.getElementById('file-upload-form');
const pdfInput = document.getElementById('pdf-input');

pdfInput.addEventListener('change', async () => {
    event.preventDefault();

    // Vérifiez si un fichier a été sélectionné
    const files = pdfInput.files;
    if (files.length === 0) {
        alert('Veuillez sélectionner un fichier PDF.');
        return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf') {
        alert('Le fichier doit être au format PDF.');
        return;
    }

    // Créez un FormData pour envoyer le fichier en tant que requête POST
    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const response = await fetch('/upload-pdf', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Fichier PDF téléversé avec succès!');
        } else {
            alert('Erreur lors du téléversement du fichier.');
        }
    } catch (error) {
        console.error('Erreur lors du téléversement du fichier:', error);
    }
});

///////////////// QCM

let score = 0;
let questionIndex = 0;
let questionList = [];
let nombreQuestions = 2;

const handleQCMTestClick = async () => {
    while (messagesContainer.firstChild) {
        messagesContainer.removeChild(messagesContainer.lastChild);
    }
    appendSimpleAIMessage("Mode Test");
    promptForm.style.display = "none";
    qcmForm.style.display = "none";
    const response = await fetch("/qcm", { method: "GET" });
    const result = await response.json();
    questionList = result.answer;
    qcmContainer.classList.remove("hidden");
    handleNewQCMClick();
}

const qcmTestButton = document.getElementById("qcm-test-button");
qcmTestButton.addEventListener("click", handleQCMTestClick);


const handleNewQCMClick = async () => {
    data = questionList[questionIndex];
    questionIndex += 1;
    displayQCM(data);
};

const handleEndQCMClick = async () => {
    qcmContainer.classList.add("hidden");
    endQCMButton.classList.add("hidden");

    qcmForm.style.display = "block";
    appendSimpleAIMessage(`Votre score est ${score}/${nombreQuestions}.`);
    score = 0;
    questionIndex = 0;
    returnChatButton.addEventListener("click", handleReturnChatButton);
    newQCMTestButton.addEventListener("click", handleQCMTestClick);
}

const handleReturnChatButton = async () => {
    qcmForm.style.display = "none";
    promptForm.style.display = "block";
    while (messagesContainer.firstChild) {
        messagesContainer.removeChild(messagesContainer.lastChild);
    }
    appendSimpleAIMessage("Je suis ton AIssistant de cours personnel ! Pose-moi une question sur le cours et je te répondrai.");
}

function displayQCM(data) {     //data doit être un dictionnaire

    const { answer, choices, correct } = data;
    const newQCMButton = document.getElementById("new-qcm-button");
    newQCMButton.classList.add("hidden");

    qcmSubmit.classList.remove("hidden");
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
        qcmSubmit.classList.add("hidden");
        const selected = document.querySelector("input[name='qcm-choice']:checked");
        if (selected) {
            if (parseInt(selected.value) === correct) {
                score += 1;
                qcmFeedback.innerHTML = "Bonne réponse !";
                qcmFeedback.style.color = "green";
            } else {
                qcmFeedback.innerHTML = "Réponse incorrecte.";
                qcmFeedback.style.color = "red";
            }
            if (questionIndex !== nombreQuestions) {
                newQCMButton.classList.remove("hidden");  // Affiche le bouton
            }
            else {
                endQCMButton.classList.remove("hidden");    // Affiche le bouton
                endQCMButton.addEventListener("click", handleEndQCMClick);
            }
        } else {
            qcmFeedback.innerHTML = "Veuillez sélectionner une réponse.";
            qcmFeedback.style.color = "orange";
            newQCMButton.classList.add("hidden");  // Cache le bouton
            qcmSubmit.classList.remove("hidden");
        }
    };

    newQCMButton.addEventListener("click", handleNewQCMClick);

}