// Classe que representa tiro no jogo
class Projectile {
    constructor(position, velocity) {
        // Posição inicial do projétil (objeto com x e y)
        this.position = position;

        // Tamanho do projétil (muito fino e comprido, estilo laser kkk)
        this.width = 2;
        this.height = 20;

        // Velocidade do projétil (negativa se sobe, positiva se desce)
        this.velocity = velocity;

        // Aqui até parece simples, mas é o que faz o tiro se mover kkk
    }

    // Desenha o projétil no canvas
    draw(ctx) {
        ctx.fillStyle = "white"; // cor do tiro
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Simples, mas parece um laser de nave espacial
    }

    // Atualiza posição do projétil a cada frame
    update() {
        this.position.y += this.velocity; // se a velocidade for negativa, sobe; positiva, desce
        
    }
}

// Exporta a classe para ser usada em outros arquivos
export default Projectile;
