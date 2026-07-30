# Typing Speed Test Solution

This is a solution to the [Typing Speed Test challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/typing-speed-test). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

---

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the interface depending on their device's screen size (Responsive Desktop & Mobile views).
- Select between 3 Difficulty levels (**Easy**, **Medium**, **Hard**) loaded dynamically from a JSON passage dataset.
- Toggle between 2 Test Modes:
  - **Timed (60s):** Counts down from 60 seconds and finishes automatically.
  - **Passage Mode:** Allows the user to finish the entire passage at their own pace with a counting timer.
- Track real-time typing metrics:
  - **WPM (Words Per Minute):** Standardized calculation based on correct character entries ($1 \text{ word} = 5 \text{ correct characters}$).
  - **Accuracy:** Dynamic percentage tracking correct vs total typed characters.
  - **Time:** Real-time countdown/count-up display.
- Handle Backspacing correctly without breaking text accuracy or double-subtracting character counts.
- Save and persist personal high scores across sessions using `localStorage`.
- View customized completion modals (**Test Complete** and **High Score Smashed!**) with performance feedback and confetti animations.

---

### Links

- Solution URL: [GitHub Repository](https://github.com/muhammadfuzail288/typing-speed-test)
- Live Site URL: [Live Deployment]([https://your-live-site-url.vercel.app](https://typing-speed-test-flax-five.vercel.app/))

---

## My process

### Built with

- Semantic HTML5 markup
- Custom CSS3 Properties (Variables for themes and active text states)
- CSS Flexbox & Responsive Media Queries (Mobile dropdown fallback)
- Vanilla JavaScript (ES6+ Async/Fetch, Event Listeners, State Management)
- LocalStorage API for Personal Best persistence
- Dynamic JSON Data Loading (`data.json`)

---

### What I learned

1. Calculating Real-Time Typing Metrics:
   Accurately calculating WPM requires dividing total correct characters by 5, and managing standard accuracy percentages without running into dividing-by-zero or boundary errors:

   ```javascript
   function calculateAccuracy() {
       if (TotalCharsTyped === 0) {
           document.querySelector("#Accuracy-Score").innerText = "100%";
           return;
       }
       
       let accuracyPercentage = Math.round((CorrectCharsTyped / TotalCharsTyped) * 100);    
       accuracyPercentage = Math.max(0, Math.min(100, accuracyPercentage));

       document.querySelector("#Accuracy-Score").innerText = `${accuracyPercentage}%`;
   }
2. .Managing State on Backspace:
Handling backspace logic cleanly so character counts are only subtracted when deleting previously correct text:
   ```javascript
 if (key === "Backspace") {
    if (currentIndex > 0) {
        currentSpan.classList.remove("active");
        currentIndex--;
        const prevSpan = spans[currentIndex];

        if (prevSpan.classList.contains("correct")) {
            if (CorrectCharsTyped > 0) CorrectCharsTyped--;
        } else if (prevSpan.classList.contains("incorrect")) {
            if (TotalErrorChars > 0) TotalErrorChars--;
        }

        if (TotalCharsTyped > 0) TotalCharsTyped--;

        updateCharDisplay();
        prevSpan.classList.remove("correct", "incorrect");
        prevSpan.classList.add("active");
        calculateAccuracy();   
    }
    return;
}
3. High Score Persistence with LocalStorage:
Checking against saved browser records to determine if a completion screen or high-score modal should trigger:
highScore = parseInt(localStorage.getItem("typingHighScore")) || 0;

if (FinalWPM > highScore) {
    localStorage.setItem("typingHighScore", FinalWPM);
    highScore = FinalWPM;
    document.querySelector(".best-score span").innerText = `${highScore} WPM`;
    ShowHighScorePage(FinalWPM, finalAccuracy, characterCount);
}
