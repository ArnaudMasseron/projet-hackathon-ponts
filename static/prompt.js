const promptForm = document.getElementById("prompt-form");
const submitButton = document.getElementById("submit-button");
const questionButton = document.getElementById("question-button");
const darkmodeButton = document.getElementById("darkmode-button");
const messagesContainer = document.getElementById("messages-container");

var body = document.getElementsByTagName('body')[0];
var darkmode=false;
var matin = new Date(2023,0,0,15,3,0);
var soir = new Date(2023,0,0,15,6,0);

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

function toggleDarkmode () {
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
        appendAIMessageDirectly("Bonne journée !");
        if(darkmode){
        toggleDarkmode();
    }
        setTimeout(checkTimeForDarkmode, tonight.getTime()-now.getTime()+1000);
        appendAIMessageDirectly(tonight.getTime()-now.getTime());
        
    }
    else if (now < thisMorning || now >= tonight) {
        // Cas "nuit"
        appendAIMessageDirectly("Bonne nuit !");
        if(!darkmode){
            toggleDarkmode();
        }
        setTimeout(checkTimeForDarkmode, thisMorning.getTime()-now.getTime()+(now>thisMorning)*(86400*1000+1000));
        appendAIMessageDirectly(thisMorning.getTime()-now.getTime()+(now>thisMorning)*(86400*1000+1000));
    }
}

checkTimeForDarkmode();




// TESTS

const test = async () => {
    appendAIMessageDirectly("Test réussi !")
}

var now = new Date();
now.setTime(0)
now.setSeconds(10)
//appendAIMessageDirectly(Date.now())
//setTimeout(test, now.getTime());

