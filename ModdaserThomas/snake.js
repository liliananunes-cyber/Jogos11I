const snake_canvas = document.getElementById("snake-simple-container");
const ctx = snake_canvas.getContext("2d");

snake_canvas.width = 800;
snake_canvas.height = 600;

const BLOCK_SIZE = 25;
const FPS = 10;
const hudHeight = 50;

let snakeDirection = "right";
let lastFrameTime = 0;

class Snake {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = "right";
        this.len = 3;
        this.body = [];
        this.game_over = false;
        this.score = 0;
    }

    move(dir) {
        if (dir === "right" && this.direction !== "left") {
            this.x += BLOCK_SIZE;
            this.direction = "right";
        } else if (dir === "left" && this.direction !== "right") {
            this.x -= BLOCK_SIZE;
            this.direction = "left";
        } else if (dir === "down" && this.direction !== "up") {
            this.y += BLOCK_SIZE;
            this.direction = "down";
        } else if (dir === "up" && this.direction !== "down") {
            this.y -= BLOCK_SIZE;
            this.direction = "up";
        }

        this.body.push([this.x, this.y]);

        if (this.body.length > this.len) {
            this.body.shift();
        }
    }

    draw() {
        ctx.fillStyle = "purple";
        for (let segment of this.body) {
            ctx.fillRect(segment[0], segment[1], BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    checkCollision() {
        if (
            this.x < 0 ||
            this.x >= snake_canvas.width ||
            this.y < hudHeight ||
            this.y >= snake_canvas.height
        ) {
            this.game_over = true;
        }

        const head = this.body[this.body.length - 1];
        for (let i = 0; i < this.body.length - 1; i++) {
            if (
                this.body[i][0] === head[0] &&
                this.body[i][1] === head[1]
            ) {
                this.game_over = true;
            }
        }
    }

    reset() {
        this.x = 200;
        this.y = 200;
        this.body = [];
        this.len = 3;
        this.score = 0;
        this.direction = "right";
        this.game_over = false;
    }
}

class Fruit {
    constructor() {
        this.resetPosition();
    }

    resetPosition() {
        this.x =
            Math.floor(Math.random() * (snake_canvas.width / BLOCK_SIZE)) *
            BLOCK_SIZE;
        this.y =
            hudHeight +
            Math.floor(
                Math.random() *
                    ((snake_canvas.height - hudHeight) / BLOCK_SIZE)
            ) *
                BLOCK_SIZE;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
    }

    getEaten(snake) {
        if (snake.x === this.x && snake.y === this.y) {
            snake.len++;
            snake.score++;
            this.resetPosition();
        }
    }
}

const snake = new Snake(200, 200);
const fruit = new Fruit();

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") snakeDirection = "up";
    if (e.code === "ArrowDown" || e.code === "KeyS") snakeDirection = "down";
    if (e.code === "ArrowLeft" || e.code === "KeyA") snakeDirection = "left";
    if (e.code === "ArrowRight" || e.code === "KeyD") snakeDirection = "right";

    if (e.code === "Enter" && snake.game_over) {
        snake.reset();
    }
});

function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const delta = timestamp - lastFrameTime;

    if (delta > 1000 / FPS) {
        lastFrameTime = timestamp;

        ctx.clearRect(0, 0, snake_canvas.width, snake_canvas.height);

        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, snake_canvas.width, hudHeight);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${snake.score}`, 20, 15);

        if (!snake.game_over) {
            snake.move(snakeDirection);
            snake.checkCollision();
            fruit.getEaten(snake);
        } else {
            ctx.fillText(
                "GAME OVER - Pressione ENTER",
                snake_canvas.width / 2 - 120,
                hudHeight / 2
            );
        }

        snake.draw();
        fruit.draw();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);