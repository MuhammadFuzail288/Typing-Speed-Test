// Start page
let Start = document.querySelector("#start");
let Startbutton = document.querySelector(".start-btn");

let selectedDifficulty = null;
let selectedMode = null;

let currentIndex = 0;
let CorrectCharsTyped = 0;
let TotalCharsTyped = 0;
let TotalErrorChars = 0;
let highScore = localStorage.getItem("typingHighScore") || 0;

document.querySelector(".best-score span").innerText =  `${highScore} WPM`;
const buttons = [
    document.getElementById("Easy"),
    document.getElementById("Medium"),
    document.getElementById("Hard"),
    document.getElementById("Timed"),
    document.getElementById("Passage")
];

const easyBtn = document.getElementById("Easy");
const mediumBtn = document.getElementById("Medium");
const hardBtn = document.getElementById("Hard");

const timedBtn = document.querySelector("#Timed");
const passageBtn = document.querySelector("#Passage");

easyBtn.addEventListener("click", () => selectDifficulty("easy"));
mediumBtn.addEventListener("click", () => selectDifficulty("medium"));
hardBtn.addEventListener("click", () => selectDifficulty("hard"));

timedBtn.addEventListener("click", () => selectMode("timed"));
passageBtn.addEventListener("click", () => selectMode("passage"));

function selectDifficulty(diff) {
    selectedDifficulty = diff;

    [easyBtn, mediumBtn, hardBtn].forEach(btn => btn.style.borderColor = "var(--silver)");
    if (diff === 'easy') easyBtn.style.borderColor = "var(--blue)";
    if (diff === 'medium') mediumBtn.style.borderColor = "var(--blue)";
    if (diff === 'hard') hardBtn.style.borderColor = "var(--blue)";

    displayPassage(diff);
}
function selectMode(mode) {
    selectedMode = mode;

    [timedBtn, passageBtn].forEach(btn => btn.style.borderColor = "var(--silver)");
    if (mode === 'timed') timedBtn.style.borderColor = "var(--blue)";
    if (mode === 'passage') passageBtn.style.borderColor = "var(--blue)";
}
// 1. Get the new dropdown elements
const mobileDiffSelect = document.getElementById("mobile-difficulty");
const mobileModeSelect = document.getElementById("mobile-mode");
if (mobileDiffSelect) {
    mobileDiffSelect.addEventListener("change", function() {
        selectedDifficulty = this.value; 
    });
}
if (mobileModeSelect) {
    mobileModeSelect.addEventListener("change", function() {
        selectedMode = this.value;
    });
}


Startbutton.addEventListener("click", () => {
    if (!selectedDifficulty && !selectedMode) {
        alert("Please select both a Difficulty and a Mode before starting!");
        return;
    }
    if (!selectedDifficulty) {
        alert("Please select a Difficulty level (Easy, Medium, or Hard)!");
        return;
    }
    if (!selectedMode) {
        alert("Please select a Mode (Timed or Passage)!");
        return;
    }
    Start.classList.add("hide");
    buttons.forEach(button => button.disabled = true);
});

//timer and character counting 
let timerRunning = false;
let timerInterval = null;
let timeLeft = 60;

function startTimer() {
    timerRunning = true;

    if(selectedMode === "timed") {
        timeLeft = 60;

        timerInterval = setInterval(() => {
            timeLeft-- ;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            document.querySelector("#Time-Score").innerText = formattedTime;
            
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                ShowCompletePage();
            };
        }, 1000);
    } else if (selectedMode === "passage") {
        let timePassed = 0;

        timerInterval = setInterval(() => {
            timePassed++;

            const minutes = Math.floor(timePassed / 60);
            const seconds = timePassed % 60;
            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            document.querySelector("#Time-Score").innerText = formattedTime;
        }, 1000);
    }
}

// Calculate Accuracy
function calculateAccuracy() {
    if (TotalCharsTyped === 0) {
        document.querySelector("#Accuracy-Score").innerText = "100%";
        return;
    }
    
    let accuracyPercentage = Math.round((CorrectCharsTyped / TotalCharsTyped) * 100);    
    accuracyPercentage = Math.max(0, Math.min(100, accuracyPercentage));

    document.querySelector("#Accuracy-Score").innerText = `${accuracyPercentage}%`;
}

// reset button
let ResetBtn = document.querySelector("#Reset-btn")
if(ResetBtn){
    ResetBtn.addEventListener("click", () => {
        resetTestState();
    });
};

// Reset function
function resetTestState(){
    clearInterval(timerInterval);
    timerRunning = false;
    timeLeft = 60;
    currentIndex = 0;
    CorrectCharsTyped = 0;
    TotalCharsTyped = 0;
    TotalErrorChars = 0;

    updateCharDisplay();
    document.querySelector("#Time-Score").innerText = "0:60";
    if ( document.querySelector("#Accuracy-Score")) {
        document.querySelector("#Accuracy-Score").innerText = "100%";
    }
    
    const spans = document.querySelectorAll("#passage-container span");
    spans.forEach(span => {
        span.classList.remove("correct", "incorrect", "active");
    });
    if (spans.length > 0) {
        spans[0].classList.add("active");
    }
}

function updateCharDisplay() {
    const wordsTyped = Math.floor(CorrectCharsTyped / 5);
    document.querySelector("#WPM-Score").innerText = wordsTyped;
}

let passageData = null;
async function loadPassage() {
    try {
        const response = await fetch ("./data.json");
        passageData = await response.json();
        displayPassage("easy");
    } catch (error) {
        console.error("Error loading passages: ",error);
    }
}

// Display passage
function displayPassage(difficulty){
    if(!passageData) return;
    currentIndex = 0;
    CorrectCharsTyped = 0;
    TotalCharsTyped = 0;
    TotalErrorChars = 0;
    updateCharDisplay();

    const list = passageData[difficulty];
    const randomPassage = list[Math.floor(Math.random() * list.length)];
    
    const passageContainer = document.querySelector("#passage-container");
    passageContainer.innerHTML = "";

    randomPassage.text.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        passageContainer.appendChild(span);
    });

    const spans = document.querySelectorAll("#passage-container span");
    if (spans.length > 0) {
        spans[0].classList.add("active");
    }
}

loadPassage();

// Handle Typing
document.addEventListener("keydown", (e) => {
    if(e.key.length > 1 && e.key !== "Backspace") return;
    handleTyping(e.key);
});

function handleTyping (key){
    if (!Start.classList.contains("hide")) return;

    const spans = document.querySelectorAll("#passage-container span");
    if(currentIndex >= spans.length){
        return;
    }

    if (!timerRunning) {
        startTimer();
    }
    const currentSpan = spans[currentIndex];
    const expectedChar = currentSpan.innerText;

    if(key === "Backspace"){
        if(currentIndex > 0){
            currentSpan.classList.remove("active");

            currentIndex-- ;
            const prevSpan = spans[currentIndex];

            if (prevSpan.classList.contains("correct")) {
                if(CorrectCharsTyped > 0) CorrectCharsTyped-- ;
            } else if (prevSpan.classList.contains("incorrect")) {
                if(TotalErrorChars > 0) TotalErrorChars--;
            }

            if(TotalCharsTyped > 0) TotalCharsTyped--;

            updateCharDisplay();
            prevSpan.classList.remove("correct","incorrect")
            prevSpan.classList.add("active");

            calculateAccuracy();   
        }
        return;
    }

    TotalCharsTyped++ ;

    if (key === expectedChar) {
        currentSpan.classList.add("correct");
        CorrectCharsTyped++ ;
        updateCharDisplay();
    } else {
        currentSpan.classList.add("incorrect");
        TotalErrorChars++;
    }

    currentSpan.classList.remove("active");
    currentIndex++;

    if(currentIndex < spans.length){
        spans[currentIndex].classList.add("active");
    } else if(selectedMode === "passage") {
        clearInterval(timerInterval);
        timerRunning = false;
        ShowCompletePage();
    }

    calculateAccuracy(); 
}

//  Show complete page
function ShowCompletePage() {
    const CompletePage = document.querySelector("#completed");
    CompletePage.classList.add("hide");

    const FinalWPM = Math.floor(CorrectCharsTyped / 5);

    let finalAccuracy = 0;
    if (TotalCharsTyped > 0) {
        finalAccuracy = Math.round((CorrectCharsTyped / TotalCharsTyped) * 100);
    } else {
        finalAccuracy = 100;
    }

    const characterCount = `${CorrectCharsTyped}/${TotalErrorChars}`;

    document.querySelector("#score-box-WPM").innerText = FinalWPM;
    document.querySelector("#score-box-accuracy").innerText = `${finalAccuracy}%`;
    document.querySelector("#score-box-char").innerText = characterCount;

    const messageEl = document.querySelector("#complete-message");
    if (finalAccuracy === 100) {
        messageEl.innerText = "Perfect score! Absolutely flawless typing!";
    } else if (finalAccuracy >= 95) {
        messageEl.innerText = "Excellent run! Keep pushing to beat your high score.";
    } else if (finalAccuracy >= 85) {
        messageEl.innerText = "Solid run. Keep pushing to beat your high score.";
    } else {
        messageEl.innerText = "Good effort! Practice makes perfect.";
    }

    highScore = parseInt(localStorage.getItem("typingHighScore")) || 0;
    
    if (FinalWPM > highScore) {
        localStorage.setItem("typingHighScore", FinalWPM);
        highScore = FinalWPM;
        document.querySelector(".best-score span").innerText = `${highScore} WPM`;
        ShowHighScorePage(FinalWPM, finalAccuracy, characterCount);
    } else {
        completePage.classList.remove("hide");
    }
}

let CompletePage = document.querySelector("#completed");
let AgainButton = document.querySelector("#again-btn ");
if(AgainButton){

    AgainButton.addEventListener("click", ()=> {
        CompletePage.classList.add("hide");
        resetTestState();

        Start.classList.remove("hide");
        buttons.forEach(button => button.disabled = false);

        selectedDifficulty = null;
        selectedMode = null;
        [easyBtn, mediumBtn, hardBtn, timedBtn, passageBtn].forEach(btn => 
            btn.style.borderColor = "var(--silver)");
    });
}

//show High Score Page
function ShowHighScorePage(wpm, accuracy, chars){
    const HighScorePage =document.querySelector(".High-Score");

    if(!HighScorePage) {
        console.log("High score page not found");
        return;
    }
    const scoreBoxes = HighScorePage.querySelectorAll(".box h2");
    if (scoreBoxes.length > 0) {
        scoreBoxes[0].innerText = wpm;
    }
    if (scoreBoxes.length > 1) {
        scoreBoxes[1].innerText = accuracy;
    }
    if (scoreBoxes.length > 2) {
        scoreBoxes[2].innerText = chars;
    }

    HighScorePage.classList.remove("hide");
}

let HighScorePage =document.querySelector(".High-Score");
let BeatButton = document.querySelector("#Beat-btn");

if(BeatButton){
    BeatButton.addEventListener("click", ()=> {
        HighScorePage.classList.add("hide");
        resetTestState();
        
        Start.classList.remove("hide");
        buttons.forEach(button => button.disabled = false);

        selectedDifficulty = null;
        selectedMode = null;
        [easyBtn, mediumBtn, hardBtn, timedBtn, passageBtn].forEach(btn => 
            btn.style.borderColor = "var(--silver)");
    });
}


