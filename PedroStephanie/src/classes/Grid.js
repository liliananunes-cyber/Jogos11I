// Classe que representa a grade de inimigos (invaders)
import Invader from "./Invader.js";

class Grid {
    constructor(rows, cols) {
        // Número de linhas e colunas da grade
        this.rows = rows;
        this.cols = cols;

        // Direção atual da grade ("right" ou "left")
        this.direction = "right";

        // Flag para indicar se a grade deve se mover para baixo
        this.moveDown = false;

        // Incremento de velocidade ao descer
        this.boost = 0.1;

        // Velocidade inicial dos invaders
        this.invadersVelocity = 1;

        // Array contendo todos os invaders da grade
        this.invaders = this.init();
    }

    // Inicializa os invaders com base em linhas e colunas
    init() {
        const array = [];

        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                const invader = new Invader(
                    {
                        x: col * 50 + 20,
                        y: row * 37 + 120,
                    },
                    this.invadersVelocity
                );

                array.push(invader);
            }
        }

        return array;
    }

    // Desenha todos os invaders no canvas
    draw(ctx) {
        this.invaders.forEach((invader) => invader.draw(ctx));
    }

    // Atualiza a posição da grade e dos invaders
    update(playerStatus) {
        // Verifica se a grade atingiu a borda direita
        if (this.reachedRightBoundary()) {
            this.direction = "left";
            this.moveDown = true;
        }
        // Verifica se a grade atingiu a borda esquerda
        else if (this.reachedLeftBoundary()) {
            this.direction = "right";
            this.moveDown = true;
        }

        // Se o jogador não estiver vivo, a grade não deve se mover para baixo
        if (!playerStatus) this.moveDown = false;

        // Atualiza cada invader da grade
        this.invaders.forEach((invader) => {
            if (this.moveDown) {
                invader.moveDown();
                invader.incrementVelocity(this.boost);
                this.invadersVelocity = invader.velocity;
            }

            if (this.direction === "right") invader.moveRight();
            if (this.direction === "left") invader.moveLeft();
        });

        // Reseta a flag de movimento para baixo
        this.moveDown = false;
    }

    // Retorna true se algum invader atingiu a borda direita da tela
    reachedRightBoundary() {
        return this.invaders.some(
            (invader) => invader.position.x + invader.width >= innerWidth
        );
    }

    // Retorna true se algum invader atingiu a borda esquerda da tela
    reachedLeftBoundary() {
        return this.invaders.some((invader) => invader.position.x <= 0);
    }

    // Retorna um invader aleatório da grade
    getRandomInvader() {
        const index = Math.floor(Math.random() * this.invaders.length);
        return this.invaders[index];
    }

    // Reinicia a grade, recriando todos os invaders
    restart() {
        this.invaders = this.init();
        this.direction = "right";
    }
}

export default Grid;
