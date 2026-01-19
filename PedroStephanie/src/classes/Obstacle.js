// Classe que representa um obstáculo no jogo (tipo barreira pra proteger o jogador)
class Obstacle {
    constructor(position, width, height, color) {
        // Posição do obstáculo no canvas (objeto com x e y)
        this.position = position;

        // Tamanho do obstáculo
        this.width = width;
        this.height = height;

        // Cor do obstáculo
        this.color = color;

       
    }

    // Desenha o obstáculo no canvas
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Parece simples, mas salva a vida do jogador várias vezes kkk
    }

    // Verifica se um projétil acertou o obstáculo
    hit(projectile) {
        // Ajusta a posição vertical do projétil dependendo da direção (pra não errar a colisão)
        const projectilePositionY =
            projectile.velocity < 0
                ? projectile.position.y // projétil indo pra cima (tiro do jogador)
                : projectile.position.y + projectile.height; // projétil indo pra baixo (inimigo)

        // Retorna true se o projétil estiver dentro dos limites do obstáculo
        return (
            projectile.position.x >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectilePositionY >= this.position.y &&
            projectilePositionY <= this.position.y + this.height
        );
        
    }
}

// Exporta a classe pra usar em outros arquivos
export default Obstacle;
