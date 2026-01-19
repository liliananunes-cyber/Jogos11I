// Classe que representa uma partícula (usada em explosões e efeitos visuais)
class Particle {
    constructor(position, velocity, radius, color) {
        // Posição inicial da partícula
        this.position = position;
        // Velocidade da partícula (x e y)
        this.velocity = velocity;
        // Tamanho da partícula
        this.radius = radius;
        // Cor da partícula
        this.color = color;
        // Opacidade inicial (1 = totalmente visível)
        this.opacity = 1;

        // nem lembro de como funciona kkk
    }

    // Desenha a partícula no canvas
    draw(ctx) {
        ctx.save(); // salva estado atual do canvas
        ctx.beginPath();
        ctx.globalAlpha = this.opacity; // aplica transparência
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore(); // volta ao estado anterior
        // Parece magia, mas é só canvas mesmo kkk
    }

    // Atualiza posição e opacidade da partícula
    update() {
        this.position.x += this.velocity.x; // movimento horizontal
        this.position.y += this.velocity.y; // movimento vertical

        // Faz a partícula desaparecer lentamente
        this.opacity = this.opacity - 0.008 <= 0 ? 0 : this.opacity - 0.008;
        // Tipo “fade out” automático, efeito de explosão style kkk
    }
}

// Exporta a classe pra ser usada em outros arquivos
export default Particle;
