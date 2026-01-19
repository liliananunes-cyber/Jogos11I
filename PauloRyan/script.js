const emojis = ['🍎','🍌','🍇','🍓','🍒','🍍','🥝','🍉'];
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = true;
let matches = 0;
let gameStarted = false;

/* ===== SONS ===== */
const flipSound = document.getElementById('flip-sound');
const victorySound = document.getElementById('victory-sound');

/* ===== TIMER ===== */
let seconds = 0;
let timerInterval;
const timerElement = document.getElementById('timer');
const game = document.getElementById('game');

/* ===== RECORD ===== */
let bestTime = localStorage.getItem('bestTime')
    ? parseInt(localStorage.getItem('bestTime'))
    : null;

const recordElement = document.getElementById('record');
updateRecordDisplay();

function updateRecordDisplay() {
    recordElement.textContent = bestTime !== null
        ? `🏆 Recorde: ${bestTime}s`
        : '🏆 Recorde: —';
}

/* ===== SETUP ===== */
function setupBoard() {
    game.innerHTML = '';
    cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    matches = 0;
    lockBoard = true;

    cards.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${emoji}</div>
            </div>
        `;

        card.addEventListener('click', () => flipCard(card));
        game.appendChild(card);
    });
}

/* ===== INICIAR ===== */
function startRound() {
    if (gameStarted) return;
    gameStarted = true;
    lockBoard = false;
    seconds = 0;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        timerElement.textContent = `⏱ Tempo: ${seconds}s`;
    }, 1000);
}

/* ===== FLIP ===== */
function flipCard(card) {
    if (!gameStarted || lockBoard || card === firstCard || card.classList.contains('matched')) return;

    flipSound.currentTime = 0;
    flipSound.play();
    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    checkMatch();
}

function checkMatch() {
    lockBoard = true;

    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matches++;
        resetBoard();

        if (matches === emojis.length) victory();
    } else {
        setTimeout(() => {
            flipSound.currentTime = 0;
            flipSound.play();
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 900);
    }
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

/* ===== CONFETE ===== */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confetti = [];
let animation;

function startConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    confetti = [];

    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            speed: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360},100%,50%)` // corrigido
        });
    }
    animateConfetti();
    setTimeout(stopConfetti, 4000);
}

function animateConfetti() {
    animation = requestAnimationFrame(animateConfetti);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    confetti.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.y += p.speed;
        if (p.y > canvas.height) p.y = -10;
    });
}

function stopConfetti() {
    cancelAnimationFrame(animation);
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

/* ===== VITÓRIA ===== */
function victory() {
    clearInterval(timerInterval);
    victorySound.play();
    startConfetti();

    if (bestTime === null || seconds < bestTime) {
        bestTime = seconds;
        localStorage.setItem('bestTime', bestTime);
        updateRecordDisplay();
    }

    document.getElementById('final-time').textContent =
        `Você venceu em ${seconds} segundos!`;
    document.getElementById('victory').style.display = 'flex';
}

/* ===== BOTÕES ===== */
document.getElementById('start-btn').onclick = startRound;

document.getElementById('pause-btn').onclick = () => {
    if (!gameStarted) return;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        lockBoard = true;
    } else {
        timerInterval = setInterval(() => {
            seconds++;
            timerElement.textContent = `⏱ Tempo: ${seconds}s`;
        }, 1000);
        lockBoard = false;
    }
};

document.getElementById('reset-timer-btn').onclick = () => {
    clearInterval(timerInterval);
    gameStarted = false;
    seconds = 0;
    timerElement.textContent = '⏱ Tempo: 0s';
    document.getElementById('victory').style.display = 'none';
    setupBoard();
};

document.getElementById('play-again-btn').onclick = () => {
    document.getElementById('victory').style.display = 'none';
    gameStarted = false;
    setupBoard();
};

setupBoard();
