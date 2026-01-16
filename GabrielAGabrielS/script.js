const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

const gridSize = 20;
let snake = [];
let food = {};
let dx = 1;
let dy = 0;
let score = 0;
let highScore = 0; // Recorde
let gameInterval;
let isGameOver = false;

function generateFood() {
    let positionOk = false;

    while (!positionOk) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };

        positionOk = !snake.some(
            segment => segment.x === food.x && segment.y === food.y
        );
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function update() {
    if (isGameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        if (score > highScore) highScore = score; // Atualiza recorde
        scoreElement.textContent = `Pontos: ${score} | Recorde: ${highScore}`;
        generateFood();
    } else {
        snake.pop();
    }

    if (checkCollision()) {
        endGame();
    }
}

function checkCollision() {
    const head = snake[0];
    const hitWall = head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize;
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    return hitWall || hitSelf;
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    alert(`Fim de jogo! Sua pontuação: ${score}`);
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    isGameOver = false;
    scoreElement.textContent = `Pontos: 0 | Recorde: ${highScore}`;

    if (gameInterval) clearInterval(gameInterval);
    generateFood();
    gameInterval = setInterval(gameLoop, 100);
}

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

restartButton.addEventListener('click', startGame);

startGame();
