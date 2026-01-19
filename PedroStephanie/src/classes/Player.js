// Importa constantes do jogo, como caminhos das imagens e frames iniciais/Bagulho dificil
import {
    INITIAL_FRAMES,
    PATH_ENGINE_IMAGE,
    PATH_ENGINE_SPRITES,
    PATH_SPACESHIP_IMAGE,
} from "../utils/constants.js";

// Importa a classe Projectile, usada para criar os tiros/ Deu trabalho mais foi 
import Projectile from "./Projectile.js";

class Player {
    constructor(canvasWidth, canvasHeight) {
        // Indica se o jogador está vivo
        this.alive = true;
        // Define a largura e altura da nave (48x48 multiplicado por 2)
        this.width = 48 * 2;
        this.height = 48 * 2;
        // Velocidade de movimento da nave
        this.velocity = 6;

        // Define a posição inicial do jogador (centro inferior do canvas)
        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: canvasHeight - this.height - 30,
        };

        // Carrega as imagens da nave, do motor e os sprites do motor
        this.image = this.getImage(PATH_SPACESHIP_IMAGE);
        this.engineImage = this.getImage(PATH_ENGINE_IMAGE);
        this.engineSprites = this.getImage(PATH_ENGINE_SPRITES);

        // Controla a animação dos sprites do motor
        this.sx = 0;
        this.framesCounter = INITIAL_FRAMES;
    }

    // Move a nave para a esquerda
    moveLeft() {
        this.position.x -= this.velocity;
    }

    // Move a nave para a direita
    moveRight() {
        this.position.x += this.velocity;
    }

    // Função que cria um objeto Image a partir de um caminho
    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    // Desenha a nave e o motor no canvas
    draw(ctx) {
        // Desenha a nave principal
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        // Desenha os sprites animados do motor
        ctx.drawImage(
            this.engineSprites,
            this.sx,
            0,
            48,
            48,
            this.position.x,
            this.position.y + 10,
            this.width,
            this.height
        );

        // Desenha a imagem do motor (camada superior)
        ctx.drawImage(
            this.engineImage,
            this.position.x,
            this.position.y + 8,
            this.width,
            this.height
        );

        // Atualiza a animação do motor
        this.update();
    }

    // Atualiza a animação do motor da nave
    update() {
        // Alterna entre os frames do sprite quando o contador chega a 0
        if (this.framesCounter === 0) {
            this.sx = this.sx === 96 ? 0 : this.sx + 48; // alterna frame do motor
            this.framesCounter = INITIAL_FRAMES; // reseta o contador
        }

        // Decrementa o contador a cada frame
        this.framesCounter--;
    }

    // Cria um novo projétil e adiciona ao array de projéteis
    shoot(projectiles) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2, // posição horizontal do tiro (centro da nave)
                y: this.position.y + 2, // posição vertical do tiro (topo da nave)
            },
            -10 // velocidade do projétil (subindo)
        );

        projectiles.push(p); // adiciona o projétil ao array de tiros
    }

    // Verifica se o jogador foi atingido por um projétil inimigo
    hit(projectile) {
        return (
            projectile.position.x >= this.position.x + 20 &&
            projectile.position.x <= this.position.x + 20 + this.width - 38 &&
            projectile.position.y + projectile.height >= this.position.y + 22 &&
            projectile.position.y + projectile.height <=
                this.position.y + 22 + this.height - 34
        );
    }
}

// Exporta a classe Player para poder ser usada em outros arquivos
export default Player;

