const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const enemy = document.querySelector('.enemy');
const gameBoard = document.querySelector('.game-board');
const scoreElement = document.getElementById('score');
const gameOverText = document.getElementById('game-over');

let score = 0;
let gameOver = false;

/* ===== TIRO ===== */
let canShoot = true;
const shootCooldown = 500;

/* PULO */
const jump = () => {
  if (!mario.classList.contains('jump')) {
    mario.classList.add('jump');
    setTimeout(() => mario.classList.remove('jump'), 500);
  }
};

/* TIRO (R) */
const shootFire = () => {
  if (gameOver || !canShoot) return;

  canShoot = false;

  const fireball = document.createElement('img');
  fireball.src = 'fire.gif';
  fireball.classList.add('fireball');

  gameBoard.appendChild(fireball);

  setTimeout(() => fireball.remove(), 600);
  setTimeout(() => canShoot = true, shootCooldown);
};

/* CONTROLES (ANTI-SPAM) */
document.addEventListener('keydown', (e) => {
  if (e.repeat) return; // 🔒 bloqueia segurar tecla
  if (e.code === 'Space') jump();
  if (e.key.toLowerCase() === 'r') shootFire();
});

/* LOOP */
const loop = setInterval(() => {
  if (gameOver) return;

  score++;
  scoreElement.innerText = `Score: ${score}`;

  const marioRect = mario.getBoundingClientRect();
  const pipeRect = pipe.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  /* CANO MATA (AJUSTADO) */
  if (
    pipeRect.left < marioRect.right - 25 &&
    pipeRect.right > marioRect.left + 25 &&
    marioRect.bottom > pipeRect.top + 15
  ) {
    endGame();
  }

  /* SONIC MATA */
  if (
    enemyRect.left < marioRect.right &&
    enemyRect.right > marioRect.left &&
    enemyRect.bottom > marioRect.top &&
    enemyRect.top < marioRect.bottom
  ) {
    endGame();
  }

  /* TIRO MATA SONIC */
  document.querySelectorAll('.fireball').forEach(fireball => {
    const fireRect = fireball.getBoundingClientRect();

    if (
      fireRect.left < enemyRect.right &&
      fireRect.right > enemyRect.left &&
      fireRect.bottom > enemyRect.top &&
      fireRect.top < enemyRect.bottom
    ) {
      enemy.style.display = 'none';
      fireball.remove();

      score += 50;
      scoreElement.innerText = `Score: ${score}`;

      setTimeout(() => {
        enemy.style.display = 'block';
        enemy.style.animation = 'enemy-animation 3s infinite linear';
      }, 1200);
    }
  });

}, 10);

/* GAME OVER */
function endGame() {
  gameOver = true;

  pipe.style.animation = 'none';
  enemy.style.animation = 'none';

  mario.style.animation = 'none';
  mario.src = 'game-over.png';
  mario.style.width = '75px';

  gameOverText.style.display = 'block';
  clearInterval(loop);
}
