// Importa classes do jogo
import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
// Importa constantes do jogo
import { GameState, NUMBER_STARS } from "./utils/constants.js";

// Cria instância dos efeitos sonoros
const soundEffects = new SoundEffects();

// Seleciona elementos da interface (telas, pontuação, botões)
const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");

// Remove a tela de Game Over inicialmente
gameOverScreen.remove();

// Configura o canvas e contexto 2D
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Define tamanho do canvas igual à janela
canvas.width = innerWidth;
canvas.height = innerHeight;

// Desativa suavização de imagem para gráficos pixelados
ctx.imageSmoothingEnabled = false;

// Estado inicial do jogo
let currentState = GameState.START;

// Dados do jogo (pontuação, nível, recorde)
const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

// Atualiza os valores de pontuação e nível na interface
const showGameData = () => {
    scoreElement.textContent = gameData.score;
    levelElement.textContent = gameData.level;
    highElement.textContent = gameData.high;
};

// Cria o jogador
const player = new Player(canvas.width, canvas.height);

// Arrays para estrelas, projéteis, partículas e obstáculos
const stars = [];
const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
const obstacles = [];

// Função para inicializar obstáculos na tela
const initObstacles = () => {
    const x = canvas.width / 2 - 50; // posição central horizontal
    const y = canvas.height - 250; // posição vertical
    const offset = canvas.width * 0.15; // distância entre obstáculos
    const color = "crimson"; // cor do obstáculo

    // Cria dois obstáculos
    const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
    const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color);

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
};

// Inicializa obstáculos
initObstacles();

// Cria a grade de inimigos com número aleatório de linhas e colunas
const grid = new Grid(
    Math.round(Math.random() * 9 + 1),
    Math.round(Math.random() * 9 + 1)
);

// Controle das teclas pressionadas
const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true,
    },
};

// Função para aumentar a pontuação
const incrementScore = (value) => {
    gameData.score += value;

    // Atualiza recorde se necessário
    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }
};

// Função para aumentar o nível
const incrementLevel = () => {
    gameData.level += 1;
};

// Gera estrelas de fundo
const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height));
    }
};

// Desenha e atualiza as estrelas
const drawStars = () => {
    stars.forEach((star) => {
        star.draw(ctx);
        star.update();
    });
};

// Desenha e atualiza todos os projéteis
const drawProjectiles = () => {
    const projectiles = [...playerProjectiles, ...invadersProjectiles];

    projectiles.forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};

// Desenha e atualiza partículas (explosões)
const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx);
        particle.update();
    });
};

// Desenha obstáculos
const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

// Remove projéteis fora da tela
const clearProjectiles = () => {
    playerProjectiles.forEach((projectile, i) => {
        if (projectile.position.y <= 0) {
            playerProjectiles.splice(i, 1);
        }
    });

    invadersProjectiles.forEach((projectile, i) => {
        if (projectile.position.y > canvas.height) {
            invadersProjectiles.splice(i, 1);
        }
    });
};

// Remove partículas invisíveis
const clearParticles = () => {
    particles.forEach((particle, i) => {
        if (particle.opacity <= 0) {
            particles.splice(i, 1);
        }
    });
};

// Cria explosão de partículas em determinada posição
const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        const particle = new Particle(
            {
                x: position.x,
                y: position.y,
            },
            {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5,
            },
            2,
            color
        );

        particles.push(particle);
    }
};

// Verifica se projéteis do jogador acertaram inimigos
const checkShootInvaders = () => {
    grid.invaders.forEach((invader, invaderIndex) => {
        playerProjectiles.some((projectile, projectileIndex) => {
            if (invader.hit(projectile)) {
                soundEffects.playHitSound();

                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#941CFF"
                );

                incrementScore(10);

                grid.invaders.splice(invaderIndex, 1);
                playerProjectiles.splice(projectileIndex, 1);

                return;
            }
        });
    });
};

// Mostra a tela de Game Over
const showGameOverScreen = () => {
    document.body.append(gameOverScreen);
    gameOverScreen.classList.add("zoom-animation");
};

// Executa o fim de jogo
const gameOver = () => {
    // Cria explosões na posição do jogador
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "white"
    );

    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "#4D9BE6"
    );

    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "crimson"
    );

    player.alive = false;
    currentState = GameState.GAME_OVER;
    showGameOverScreen();
};

// Verifica se projéteis inimigos acertaram o jogador
const checkShootPlayer = () => {
    invadersProjectiles.some((projectile, index) => {
        if (player.hit(projectile)) {
            soundEffects.playExplosionSound();
            invadersProjectiles.splice(index, 1);

            gameOver();
        }
    });
};

// Verifica se projéteis acertaram obstáculos
const checkShootObstacles = () => {
    obstacles.forEach((obstacle) => {
        playerProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) {
                playerProjectiles.splice(index, 1);
                return;
            }
        });

        invadersProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) {
                invadersProjectiles.splice(index, 1);
                return;
            }
        });
    });
};

// Verifica colisão de inimigos com obstáculos
const checkInvadersCollidedObstacles = () => {
    obstacles.forEach((obstacle, i) => {
        grid.invaders.some((invader) => {
            if (invader.collided(obstacle)) {
                obstacles.splice(i, 1);
            }
        });
    });
};

// Verifica se inimigos colidiram com o jogador
const checkPlayerCollidedInvaders = () => {
    grid.invaders.some((invader) => {
        if (
            invader.position.x >= player.position.x &&
            invader.position.x <= player.position.x + player.width &&
            invader.position.y >= player.position.y
        ) {
            gameOver();
        }
    });
};

// Cria uma nova grade de inimigos se todos forem destruídos
const spawnGrid = () => {
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();

        grid.rows = Math.round(Math.random() * 9 + 1);
        grid.cols = Math.round(Math.random() * 9 + 1);
        grid.restart();

        incrementLevel();

        if (obstacles.length === 0) {
            initObstacles();
        }
    }
};

// Loop principal do jogo
const gameLoop = () => {
    // Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha fundo de estrelas
    drawStars();

    if (currentState === GameState.PLAYING) {
        // Atualiza interface
        showGameData();
        // Gera inimigos se necessário
        spawnGrid();

        // Desenha elementos do jogo
        drawProjectiles();
        drawParticles();
        drawObstacles();

        // Remove elementos fora da tela
        clearProjectiles();
        clearParticles();

        // Verifica colisões
        checkShootInvaders();
        checkShootPlayer();
        checkShootObstacles();
        checkInvadersCollidedObstacles();
        checkPlayerCollidedInvaders();

        // Desenha e atualiza a grade de inimigos
        grid.draw(ctx);
        grid.update(player.alive);

        // Salva estado do canvas para rotação
        ctx.save();

        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );

        // Atira se a tecla de tiro estiver pressionada
        if (keys.shoot.pressed && keys.shoot.released) {
            soundEffects.playShootSound();
            player.shoot(playerProjectiles);
            keys.shoot.released = false;
        }

        // Move e rotaciona a nave para esquerda
        if (keys.left && player.position.x >= 0) {
            player.moveLeft();
            ctx.rotate(-0.15);
        }

        // Move e rotaciona a nave para direita
        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight();
            ctx.rotate(0.15);
        }

        // Reverte a rotação do canvas
        ctx.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );

        // Desenha o jogador
        player.draw(ctx);
        ctx.restore();
    }

    if (currentState === GameState.GAME_OVER) {
        // Verifica colisões de projéteis com obstáculos mesmo na tela de Game Over
        checkShootObstacles();

        // Desenha elementos
        drawProjectiles();
        drawParticles();
        drawObstacles();

        // Remove elementos fora da tela
        clearProjectiles();
        clearParticles();

        // Desenha e atualiza grade de inimigos
        grid.draw(ctx);
        grid.update(player.alive);
    }

    // Chama o loop novamente
    requestAnimationFrame(gameLoop);
};

// Reinicia o jogo
const restartGame = () => {
    currentState = GameState.PLAYING;

    player.alive = true;

    grid.invaders.length = 0;
    grid.invadersVelocity = 1;

    invadersProjectiles.length = 0;
    gameData.score = 0;
    gameData.level = 0;

    gameOverScreen.remove();
};

// Eventos de teclado
addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = true;
    if (key === "d") keys.right = true;
    if (key === "enter") keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = false;
    if (key === "d") keys.right = false;
    if (key === "enter") {
        keys.shoot.pressed = false;
        keys.shoot.released = true;
    }
});

// Botão para iniciar o jogo
buttonPlay.addEventListener("click", () => {
    startScreen.remove();
    scoreUi.style.display = "block";
    currentState = GameState.PLAYING;

    // Inimigos atiram a cada 1 segundo
    setInterval(() => {
        const invader = grid.getRandomInvader();

        if (invader) {
            invader.shoot(invadersProjectiles);
        }
    }, 1000);
});

// Botão para reiniciar o jogo
buttonRestart.addEventListener("click", restartGame);

// Inicializa estrelas e inicia loop do jogo
generateStars();
gameLoop();
