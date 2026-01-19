// Classe que representa uma estrela de fundo (só estética mesmo kkk)
class Star {
    constructor(canvasWidth, canvasHeight) {
        // Posição aleatória da estrela dentro do canvas
        this.position = {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
        };

        // Tamanho da estrela (bem pequenininha, tipo pontinho de luz)
        this.radius = Math.random() * 1 + 0.3;

        // Velocidade da estrela (quanto maior, mais rápido cai)
        this.velocity = (Math.random() * 0.4 + 0.1) * this.radius;

        // Guarda tamanho do canvas pra poder resetar a posição depois
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.color = "white"; // cor da estrela
        // Se quiser mudar cor, só alterar aqui, tipo "yellow" pra estrela amarela kkk
    }

    // Desenha a estrela no canvas
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        // Parece simples, mas dá aquele efeito espacial top kkk
    }

    // Atualiza a posição da estrela
    update() {
        // Se a estrela sair da tela embaixo, volta pro topo com nova posição aleatória
        if (this.position.y > this.canvasHeight + this.radius) {
            this.position.y = -this.radius; // volta pro topo
            this.position.x = Math.random() * this.canvasWidth; // nova posição horizontal
            this.velocity = (Math.random() * 0.4 + 0.1) * this.radius; // nova velocidade
            
        }

        // Faz a estrela se mover pra baixo
        this.position.y += this.velocity;
        // Simples movimento vertical, mas dá sensação de profundidade
    }
}

// Exporta a classe pra poder usar no jogo
export default Star;
