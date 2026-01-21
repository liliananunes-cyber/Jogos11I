const mario = document.getElementById('mario');
const pipesContainer = document.querySelector('.pipes');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const menu = document.getElementById('menu');

const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');

let marioBottom = 0;
let velocity = 0;
let isJumping = false;
let pipes = [];
let score = 0;
let speed = 6;
let running = false;

const gravity = 0.5;
const jumpForce = 15;

// RECORD
recordEl.textContent = localStorage.getItem('record') || 0;

/* INICIAR JOGO */
function startGame() {
  menu.style.display = 'none';

  running = true;
  score = 0;
  speed = 12;

  pipes.forEach(pipe => pipe.remove());
  pipes = [];
  pipesContainer.innerHTML = '';

  marioBottom = 0;
  velocity = 12;
  isJumping = false;

  scoreEl.textContent = 0;

  gameLoop();
}

/* PULO */
function jump() {
  if (!isJumping && running) {
    velocity = jumpForce;
    isJumping = true;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

document.addEventListener('keydown', jump);
document.addEventListener('touchstart', jump);

/* CRIAR PIPE */
function createPipe() {
  if (!running) return;

  const pipe = document.createElement('div');
  pipe.classList.add('pipe');

  const height = Math.floor(Math.random() * 80 + 100);
  pipe.style.height = height + 'px';
  pipe.style.left = window.innerWidth + 'px';

  pipesContainer.appendChild(pipe);
  pipes.push(pipe);
}

/* INTERVALO DE PIPES */
setInterval(() => {
  if (running) createPipe();
}, 2000);

/* LOOP PRINCIPAL */
function gameLoop() {
  if (!running) return;

  // FÍSICA DO MARIO
  velocity -= gravity;
  marioBottom += velocity;

  if (marioBottom <= 0) {
    marioBottom = 0;
    velocity = 0.8;
    isJumping = false;
  }

  mario.style.bottom = marioBottom + 60 + 'px';

  // PIPES
  pipes.forEach((pipe, index) => {
    let x = pipe.offsetLeft - speed;
    pipe.style.left = x + 'px';

    const marioRect = mario.getBoundingClientRect();
    const pipeRect = pipe.getBoundingClientRect();

    // COLISÃO REAL
    if (
      marioRect.right > pipeRect.left &&
      marioRect.left < pipeRect.right &&
      marioRect.bottom > pipeRect.top
    ) {
      gameOver();
    }

    // PIPE SAIU DA TELA
    if (x < -120) {
      pipe.remove();
      pipes.splice(index, 1);

      score++;
      scoreEl.textContent = score;
      speed += 0.2;
    }
  });

  requestAnimationFrame(gameLoop);
}

/* GAME OVER */
function gameOver() {
  if (!running) return;

  running = false;
  gameOverSound.currentTime = 0;
  gameOverSound.play();

  const record = Math.max(
    score,
    Number(localStorage.getItem('record')) || 0
  );

  localStorage.setItem('record', record);
  recordEl.textContent = record;

  menu.style.display = 'flex';
}