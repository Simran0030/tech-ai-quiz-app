const categorySelect = document.getElementById("category");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const questionEl = document.getElementById("question");
const optionsList = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const resultScreen = document.getElementById("result-screen");
const scoreText = document.getElementById("score-text");

// Loader
const loader = document.createElement("p");
loader.textContent = "Loading questions...";
loader.style.marginTop = "1rem";

let questions = [];
let current = 0;
let score = 0;

startBtn.onclick = async () => {
  const category = categorySelect.value;
  startBtn.disabled = true;
  startScreen.appendChild(loader);

  try {
    const res = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });

    const data = await res.json();

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Invalid question format");
    }

    questions = shuffleArray(data.questions).slice(0, 5); // Limit to 5
    current = 0;
    score = 0;

    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    showQuestion();
  } catch (err) {
    alert("Error fetching questions. Please try again.");
    console.error(err);
  } finally {
    startBtn.disabled = false;
    loader.remove();
  }
};

function showQuestion() {
  const q = questions[current];
  questionEl.textContent = `Q${current + 1}: ${q.question}`;
  optionsList.innerHTML = "";

  q.options.forEach((option, i) => {
    const li = document.createElement("li");
    li.textContent = option;
    li.onclick = () => handleAnswer(i, q.answer);
    optionsList.appendChild(li);
  });

  nextBtn.style.display = "none";
}

function handleAnswer(selected, correctIndex) {
  const options = [...optionsList.children];
  options.forEach((li, i) => {
    li.onclick = null;
    if (i === correctIndex) li.classList.add("correct");
    else if (i === selected) li.classList.add("wrong");
  });

  if (selected === correctIndex) score++;

  nextBtn.style.display = "inline-block";
}

nextBtn.onclick = () => {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreText.textContent = `You scored ${score} out of ${questions.length}`;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}
