// -------------------- GLOBAL STATE --------------------
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
let secretPattern = []; // 4 colors
let currentGuess = ["", "", "", ""];
let currentRow = 1;
let gameActive = false;
let patternMode = false;

// DOM ELEMENTS
const menu = document.getElementById("menu");
const patternArea = document.getElementById("pattern_area");
const gameArea = document.getElementById("game_area");
const feedbackBox = document.querySelector(".feedback_container");

const guessSlots = document.querySelectorAll("#guess .guess_pin");
const colorButtons = document.querySelectorAll("#color_select .selector_pin");

// -------------------- GAME MODE SELECTION --------------------
function start1v1() {
    menu.classList.add("hidden");
    patternArea.classList.remove("hidden");
    patternMode = true;
    feedbackBox.textContent = "Player 1: Create a pattern.";
}

function startvPC() {
    menu.classList.add("hidden");

    // Generate random computer pattern
    secretPattern = Array.from({ length: 4 }, () =>
        COLORS[Math.floor(Math.random() * COLORS.length)]
    );

    console.log("SECRET PATTERN:", secretPattern);

    startGame();
}

// -------------------- PLAYER SETS PATTERN --------------------
const patternPins = document.querySelectorAll("#pattern_answer .big_pin");
const patternColors = document.querySelectorAll("#pattern_color_select .selector_pin");

patternPins.forEach(pin => {
    pin.addEventListener("click", () => {
        patternPins.forEach(p => p.classList.remove("selected"));
        pin.classList.add("selected");
    });
});

patternColors.forEach(colorBtn => {
    colorBtn.addEventListener("click", () => {
        const selected = document.querySelector("#pattern_answer .big_pin.selected");
        if (!selected) return;

        const color = colorBtn.id;
        selected.style.background = color;
        selected.dataset.color = color;
        selected.classList.remove("selected");

        // Check if all 4 colors are chosen
        const filled = [...patternPins].every(pin => pin.dataset.color);
        if (filled) {
            secretPattern = [...patternPins].map(p => p.dataset.color);
            console.log("1v1 SECRET PATTERN:", secretPattern);

            patternArea.classList.add("hidden");
            startGame();
        }
    });
});


// -------------------- START GAME --------------------
function startGame() {
    gameArea.classList.remove("hidden");
    gameActive = true;
    feedbackBox.textContent = "Make a guess!";
}

// -------------------- COLOR SELECTION FOR GUESSES --------------------
let guessIndex = 0;

colorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (!gameActive) return;

        if (guessIndex < 4) {
            const color = btn.id;
            guessSlots[guessIndex].style.background = color;
            currentGuess[guessIndex] = color;
            guessIndex++;
        }
    });
});

// -------------------- CLEAR CURRENT GUESS --------------------
document.getElementById("clear").addEventListener("click", () => {
    currentGuess = ["", "", "", ""];
    guessIndex = 0;

    guessSlots.forEach(pin => {
        pin.style.background = "rgb(207, 187, 165)";
    });

    feedbackBox.textContent = "Guess cleared.";
});

// -------------------- CHECK GUESS --------------------
document.getElementById("check").addEventListener("click", () => {
    if (!gameActive) return;

    if (currentGuess.includes("")) {
        feedbackBox.textContent = "You must pick 4 colors!";
        return;
    }

    let rowID = `guess${currentRow}`;
    const rowPins = document.querySelectorAll(`#${rowID} .big_pin`);

    // Fill guess on the board
    rowPins.forEach((pin, i) => {
        pin.style.background = currentGuess[i];
    });

    // Evaluate guess
    const evaluation = evaluateGuess(currentGuess, secretPattern);
    showFeedback(evaluation, currentRow);

    if (evaluation.black === 4) {
        feedbackBox.textContent = "You Win! Great job!";
        revealAnswer();
        gameActive = false;
        return;
    }

    currentRow++;

    if (currentRow > 10) {
        feedbackBox.textContent = "Out of guesses! You lose!";
        revealAnswer();
        gameActive = false;
        return;
    }

    currentGuess = ["", "", "", ""];
    guessIndex = 0;

    guessSlots.forEach(pin => {
        pin.style.background = "rgb(207, 187, 165)";
    });

    feedbackBox.textContent = "Next guess!";
});

// -------------------- EVALUATION LOGIC --------------------
function evaluateGuess(guess, answer) {
    let black = 0; // correct color + correct position
    let white = 0; // correct color but wrong position

    let answerCopy = [...answer];
    let guessCopy = [...guess];

    // First pass — black pins
    guessCopy.forEach((color, i) => {
        if (color === answerCopy[i]) {
            black++;
            guessCopy[i] = answerCopy[i] = null;
        }
    });

    // Second pass — white pins
    guessCopy.forEach(color => {
        if (color && answerCopy.includes(color)) {
            white++;
            answerCopy[answerCopy.indexOf(color)] = null;
        }
    });

    return { black, white };
}

// -------------------- SHOW FEEDBACK PINS --------------------
function showFeedback(evaluation, row) {
    const feedbackRow =
    document.querySelectorAll(".right .ans_container")[11 - row];


    let pins = feedbackRow.querySelectorAll(".small_pin");

    let colorPins = [];
    for (let i = 0; i < evaluation.black; i++) colorPins.push("black");
    for (let i = 0; i < evaluation.white; i++) colorPins.push("white");

    colorPins.forEach((c, i) => {
        pins[i].style.background = c === "black" ? "#000" : "#fff";
    });
}

// -------------------- REVEAL SECRET PATTERN --------------------
function revealAnswer() {
    const ansPins = document.querySelectorAll("#answer .big_pin");

    ansPins.forEach((pin, i) => {
        pin.style.background = secretPattern[i];
        pin.textContent = "";
    });
}

// -------------------- RESET --------------------
document.getElementById("reset").addEventListener("click", () => {
    location.reload();
});

// -------------------- INSTRUCTIONS POPUP --------------------
document.getElementById("instructions").addEventListener("click", () => {
    alert(`
Mastermind Instructions:

• Choose a game mode.
• Pick 4 colors each guess.
• Black = Correct color & position.
• White = Correct color but wrong position.
• Try to guess the pattern in 10 turns!
`);
});
