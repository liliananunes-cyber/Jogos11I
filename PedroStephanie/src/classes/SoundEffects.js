// Classe responsável por gerenciar todos os efeitos sonoros do jogo
class SoundEffects {
    constructor() {
        // Array de sons de tiro (mesmo som repetido, tipo “só pra garantir que vai tocar kkk”)
        this.shootSounds = [
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
        ];

        // Array de sons de acerto (repete várias vezes porque… sei lá kkk)
        this.hitSounds = [
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
        ];

        // Som de explosão (sempre que explode… faz barulho!)
        this.explosionSound = new Audio("src/assets/audios/explosion.mp3");
        // Som de próximo nível (pra se sentir um herói, acho kkk)
        this.nextLevelSound = new Audio("src/assets/audios/next_level.mp3");

        this.currentShootSound = 0;
        this.currentHitSound = 0;

        this.adjustVolumes();

        // Aqui eu já nem sei mais se precisa, mas tá funcionando então tá ok kkk
    }

    // Toca som de tiro
    playShootSound() {
        this.shootSounds[this.currentShootSound].currentTime = 0; // reset pra tocar do começo
        this.shootSounds[this.currentShootSound].play();
        // Avança pro próximo som (loop infinito, tipo “run forever” kkk)
        this.currentShootSound =
            (this.currentShootSound + 1) % this.shootSounds.length;
    }

    // Toca som de acerto
    playHitSound() {
        this.hitSounds[this.currentHitSound].currentTime = 0;
        this.hitSounds[this.currentHitSound].play();
        this.currentHitSound = (this.currentHitSound + 1) % this.hitSounds.length;
    }

    // Explosão do jogador ou inimigo
    playExplosionSound() {
        this.explosionSound.play();
    }

    // Avançou de nível? toca esse som
    playNextLevelSound() {
        this.nextLevelSound.play();
    }

    // Ajusta volumes 
    adjustVolumes() {
        this.hitSounds.forEach((sound) => (sound.volume = 0.2));
        this.shootSounds.forEach((sound) => (sound.volume = 0.5));
        this.explosionSound.volume = 0.2;
        this.nextLevelSound.volume = 0.4;

        // Se ficar alto demais… é culpa do programador kkk
    }
}

export default SoundEffects;
