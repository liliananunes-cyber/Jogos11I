// Classe que representa um inimigo (invader) no jogo
import { PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

class Invader {
    constructor(position, velocity) {
        // Posição inicial do invader
        this.position = position;

        // Escala da imagem do invader (reduz um pouco)
        this.scale = 0.8;
        this.width = 50 * this.scale;
        this.height = 37 * this.scale;

        // Velocidade do invader
        this.velocity = velocity;

        // Carrega a imagem do invader
        this.image = this.getImage(PATH_INVADER_IMAGE);

        // Aqui é só invader básico, mas parece fofinho kkk
    }

    // Move o invader pra direita
    moveRight() {
        this.position.x += this.velocity;
    }

    // Move o invader pra esquerda
    moveLeft() {
        this.position.x -= this.velocity;
    }

    // Move o invader pra baixo (quando bate na borda)
    moveDown() {
        this.position.y += this.height;
        // Tipo “descendo sobre nossas cabeças” kkk
    }

    // Aumenta a velocidade do invader (quando passa de nível)
    incrementVelocity(boost) {
        this.velocity += boost;
    }

    // Função pra carregar imagem
    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    // Desenha o invader no canvas
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    // Invader atira um projétil
    shoot(projectiles) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2, // projétil sai do meio da nave
                y: this.position.y + this.height, // projétil sai de baixo do invader
            },
            10 // velocidade do projétil (vai pra baixo)
        );
        projectiles.push(p);
        // Inimigo tentando matar jogador… não é pessoal kkk
    }

    // Verifica se o projétil do jogador acertou o invader
    hit(projectile) {
        return (
            projectile.position.x >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y >= this.position.y &&
            projectile.position.y <= this.position.y + this.height
        );
        // Simples checagem de colisão retangular
    }

    // Verifica se invader colidiu com um obstáculo
    collided(obstacle) {
        return (
            (obstacle.position.x >= this.position.x &&
                obstacle.position.x <= this.position.x + this.width &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height) ||
            (obstacle.position.x + obstacle.width >= this.position.x &&
                obstacle.position.x <= this.position.x &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height)
        );
        
    }
}

// Exporta a classe para usar em outros arquivos
export default Invader;
