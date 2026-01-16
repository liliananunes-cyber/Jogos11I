// ================= BOARD =================
let board, context;

// ================= BIRD =================
let birdWidth = 50;
let birdHeight = 60;
let birdX, birdY;
let birdImg = new Image();
let bird = { x:0, y:0, width:birdWidth, height:birdHeight };

// ================= MENU IMAGENS =================
let menuMonkey1 = new Image();
menuMonkey1.src = "./macaobetp.png";

let menuMonkey2 = new Image();
menuMonkey2.src = "./macaobetp2.png";

// ================= PIPES =================
let pipeArray = [];
let pipeWidth = 120;
let pipeHeight = 512;
let pipeX;
let pipeY = 0;

let topPipeImg = new Image();
topPipeImg.src = "./ori (1).png";

let bottomPipeImg = new Image();
bottomPipeImg.src = "./ori.png";

// ================= PHYSICS =================
let velocityX = -6;
let velocityY = 0;
let gravity = 0.4;
let openingSpace;

// ================= GAME STATE =================
let gameOver = false;
let paused = false;
let nightMode = false;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") 
                ? parseInt(localStorage.getItem("flappyHighScore")) 
                : 0; // recorde salvo

let pointsPerPipe = 1; // pontos por pipe, mudam com dificuldade

// ================= SCORE ELÁSTICO =================
let scoreScale = 1;       // escala atual do score
let targetScale = 1;      // alvo da escala
let scoreVelocity = 0;    // velocidade para efeito elástico

// ================= MENU =================
let showStartMenu = true;
let selectedMonkey = 1;

// ================= PAUSE BUTTON =================
let pauseBtn = { x:0, y:15, width:40, height:40 };

// ================= START =================
window.onload = () => {
    board = document.getElementById("board");
    context = board.getContext("2d");

    birdImg.src = "./macaobetp.png";

    resizeCanvas();
    setDifficulty("normal");

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("keydown", handleKey);
    board.addEventListener("click", handleClick);
    board.addEventListener("touchstart", handleTouch);

    setInterval(placePipes, 1500);
    requestAnimationFrame(update);
};

// ================= RESIZE =================
function resizeCanvas() {
    board.width = window.innerWidth;
    board.height = window.innerHeight;

    birdX = board.width / 8;
    birdY = board.height / 2;

    bird.x = birdX;
    bird.y = birdY;

    pipeX = board.width;
}

// ================= UPDATE =================
function update() {
    requestAnimationFrame(update);
    context.clearRect(0,0,board.width,board.height);

    if (nightMode) {
        context.fillStyle = "#000814";
        context.fillRect(0,0,board.width,board.height);
    }

    if (showStartMenu) {
        drawStartMenu();
        return;
    }

    if (!paused && !gameOver) {
        velocityY += gravity;
        bird.y += velocityY;

        if (bird.y > board.height) gameOver = true;

        for (let pipe of pipeArray) {
            pipe.x += velocityX;

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += pointsPerPipe; // pontuação variável por dificuldade
                pipe.passed = true;

                // efeito elástico
                targetScale = 1.5;

                // Atualizar recorde
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("flappyHighScore", highScore);
                }
            }

            if (detectCollision(bird, pipe)) gameOver = true;
        }

        while (pipeArray.length && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }
    }

    // ================= SCORE ELÁSTICO =================
    let stiffness = 0.2;
    let damping = 0.7;
    let accel = (targetScale - scoreScale) * stiffness;
    scoreVelocity = (scoreVelocity + accel) * damping;
    scoreScale += scoreVelocity;
    if (targetScale > 1) targetScale -= 0.02;

    // ================= DESENHAR ELEMENTOS =================
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    pipeArray.forEach(p => context.drawImage(p.img, p.x, p.y, p.width, p.height));

    drawScore();       // score central com efeito elástico
    drawHighScore();   // recorde canto superior esquerdo
    drawPauseIcon();

    if (paused) drawPauseMenu();
    if (gameOver) drawGameOver();
}

// ================= PIPES =================
function placePipes() {
    if (paused || gameOver || showStartMenu) return;

    let randomY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);

    pipeArray.push({
        img: topPipeImg,
        x: pipeX,
        y: randomY,
        width: pipeWidth,
        height: pipeHeight,
        passed:false
    });

    pipeArray.push({
        img: bottomPipeImg,
        x: pipeX,
        y: randomY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed:false
    });
}

// ================= INPUT =================
function handleKey(e) {
    if (["Space","ArrowUp"].includes(e.code)) e.preventDefault();

    if (showStartMenu) {
        if (e.code==="Digit1") selectMonkey(1);
        if (e.code==="Digit2") selectMonkey(2);
        if (e.code==="Enter") startGame();
        return;
    }

    if (e.code==="KeyP") paused=!paused;

    if (paused) {
        if (e.code==="Digit1") setDifficulty("easy");
        if (e.code==="Digit2") setDifficulty("normal");
        if (e.code==="Digit3") setDifficulty("hard");
        if (e.code==="KeyN") nightMode=!nightMode;
        if (e.code==="KeyR") resetGame();
        if (e.code==="KeyM") goToStartMenu();
        return;
    }

    if (["Space","ArrowUp"].includes(e.code)) {
        velocityY = -6;
        if (gameOver) resetGame();
    }
}

// ================= CLICK =================
function handleClick(e) {
    let rect = board.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // PAUSE PRIMEIRO
    if (
        x >= pauseBtn.x && x <= pauseBtn.x + pauseBtn.width &&
        y >= pauseBtn.y && y <= pauseBtn.y + pauseBtn.height
    ) {
        paused = !paused;
        return;
    }

    if (showStartMenu) {
        selectMonkey(x < board.width/2 ? 1 : 2);
        startGame();
        return;
    }

    if (paused) return;

    velocityY = -6;
    if (gameOver) resetGame();
}

// ================= TOUCH =================
function handleTouch(e) {
    e.preventDefault();
    if (showStartMenu) {
        let touch = e.touches[0];
        selectMonkey(touch.clientX < board.width/2 ? 1 : 2);
        startGame();
        return;
    }

    if (paused) return;

    velocityY = -6;
    if (gameOver) resetGame();
}

// ================= UI =================
function drawStartMenu() {
    context.fillStyle = "rgba(30,30,30,0.9)";
    context.fillRect(0,0,board.width,board.height);

    context.strokeStyle = "white";
    context.lineWidth = 5;
    context.strokeRect(board.width/2-250, board.height/2-200, 500, 400);

    context.fillStyle = "white";
    context.textAlign = "center";
    context.font = "32px 'Press Start 2P'";
    context.fillText("FLAPPY MACACO", board.width/2, board.height/2-120);

    context.font = "20px 'Press Start 2P'";
    context.fillText("ESCOLHA SEU MACACO", board.width/2, board.height/2-70);

    context.drawImage(menuMonkey1, board.width/2-150, board.height/2-10, 60, 60);
    context.drawImage(menuMonkey2, board.width/2+90, board.height/2-10, 60, 60);

    context.strokeStyle = "yellow";
    context.strokeRect(
        selectedMonkey===1 ? board.width/2-150 : board.width/2+90,
        board.height/2-10,
        60,60
    );

    context.fillText("Clique para começar", board.width/2, board.height/2+150);
}

function drawPauseMenu() {
    context.fillStyle="rgba(0,0,0,0.8)";
    context.fillRect(0,0,board.width,board.height);

    context.fillStyle="white";
    context.font="24px 'Press Start 2P'";
    context.textAlign="center";

    ["1-Fácil","2-Normal","3-Difícil","N-Noite","R-Reiniciar","M-Menu"]
        .forEach((t,i)=>context.fillText(t, board.width/2, board.height/2-80+i*40));
}

function drawGameOver() {
    context.fillStyle="rgba(0,0,0,0.7)";
    context.fillRect(0,0,board.width,board.height);

    context.fillStyle="red";
    context.font="50px 'Press Start 2P'";
    context.textAlign="center";
    context.fillText("GAME OVER", board.width/2, board.height/2-20);
}

// ================= SCORE =================
function drawScore() {
    context.save();

    context.fillStyle = "white";
    context.font = `${40 * scoreScale}px 'Press Start 2P', monospace`;
    context.textAlign = "center";

    context.shadowColor = "black";
    context.shadowBlur = 5;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;

    context.fillText(score, board.width / 2, 60);

    context.restore();
}

function drawHighScore() {
    context.save();
    context.fillStyle = "yellow";
    context.font = "24px 'Press Start 2P', monospace";
    context.textAlign = "left";

    context.shadowColor = "black";
    context.shadowBlur = 3;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    context.fillText("Recorde: " + highScore, 20, 40);
    context.restore();
}

// ================= PAUSE ICON =================
function drawPauseIcon() {
    pauseBtn.x = board.width - 60;
    context.fillStyle="rgba(0,0,0,0.5)";
    context.fillRect(pauseBtn.x,pauseBtn.y,pauseBtn.width,pauseBtn.height);

    context.fillStyle="white";
    context.fillRect(pauseBtn.x+10,pauseBtn.y+8,6,24);
    context.fillRect(pauseBtn.x+22,pauseBtn.y+8,6,24);
}

// ================= HELPERS =================
function resetGame() {
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    paused = false;
    scoreScale = 1;
    targetScale = 1;
    scoreVelocity = 0;
}

function setDifficulty(level) {
    if (level==="easy") {
        velocityX = -4;
        gravity = 0.3;
        openingSpace = board.height/3;
        pointsPerPipe = 2;
    } 
    else if (level==="normal") {
        velocityX = -6;
        gravity = 0.4;
        openingSpace = board.height/4;
        pointsPerPipe = 3;
    } 
    else { // hard
        velocityX = -9;
        gravity = 0.6;
        openingSpace = board.height/5;
        pointsPerPipe = 4;
    }
}

function detectCollision(a,b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function selectMonkey(n) {
    selectedMonkey = n;
    birdImg.src = n===1 ? "./macaobetp.png" : "./macaobetp2.png";
}

function startGame() {
    showStartMenu = false;
    resetGame();
}

function goToStartMenu() {
    showStartMenu = true;
    resetGame();
}
