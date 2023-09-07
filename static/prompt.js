const promptForm = document.getElementById("prompt-form");
const submitButton = document.getElementById("submit-button");
const questionButton = document.getElementById("question-button");
const darkmodeButton = document.getElementById("darkmode-button");
const messagesContainer = document.getElementById("messages-container");

var body = document.getElementsByTagName('body')[0];
var darkmode = false;
var matin = new Date(2023, 0, 0, 15, 3, 0);
var soir = new Date(2023, 0, 0, 15, 6, 0);

const appendHumanMessage = (message) => {
    const humanMessageElement = document.createElement("div");
    humanMessageElement.classList.add("message", "message-human");
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
