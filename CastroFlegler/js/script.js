const mario = document.querySelector('.mario');
const obstaculos = document.querySelectorAll('.obstaculos img');
let obstaculoSelecionado = null;
let scoreValue=0;
let pontuou = false;
let colidiu = false;
let energetico = false;
let pausado = false;

// Função que ativa a animação de pular
const jump = () =>{
    // Verifica se o jogo esta pausado
    if(pausado) return;

    //Adiciona a classe jump (que contém a animação), e remove em seguida
    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
    }, 700);
}


// Função que seleciona um obstaculo aleatorio
const selectObstaculo = () => {
    let num = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

    // Verifica se ja existe um obstaculo aparecendo e o esconde
    if(obstaculoSelecionado != null){
        obstaculoSelecionado.style.display = 'none';
        obstaculoSelecionado = null;
    }

    // Seleciona o cano em 40%  dos casos, energetico ou passaro nos outros 60 (30 cada)
    if (num < 6){
        obstaculos[0].style.display = 'block';
        obstaculoSelecionado = obstaculos[0]
    }
    else if(num >= 8){
        obstaculos[2].style.display = 'block';
        obstaculoSelecionado = obstaculos[2]
    }
    else{
        obstaculos[1].style.display = 'block';
        obstaculoSelecionado = obstaculos[1]
    }

    // Verifica se o energetico está ativado
    if(energetico){
        console.log('peguei');
        
        obstaculoSelecionado.style.animation = 'obstaculo-animation 1.2s infinite linear';
    } else{
        obstaculoSelecionado.style.animation = 'obstaculo-animation 2.6s infinite linear';
    }
}


// Coloca um obstaculo aleatorio antes do inicio do jogo
selectObstaculo();


// Loop principal do jogo
const loop = setInterval(() => {

    // Verifica se o jogo está pausado ou não
    if (pausado) return;

    // Obtem as posiçoes do personagem e do obstaculo para verificar colisao
    const obstaculo = obstaculoSelecionado.offsetLeft;
    const marioPosition = window.getComputedStyle(mario).bottom.replace('px', '');
    
        // Seleciona qual logica aplicar conforme o tipo de obstaculo
        if(obstaculo <= 120){
    
            if (obstaculoSelecionado.id === "cano" && obstaculo > 0 && marioPosition < 80){
                colidiu = true;
            }
    
            else if(obstaculoSelecionado.id === "passaro" && obstaculo > 0 && marioPosition != 0){
                colidiu = true;
            }
    
            else if(obstaculoSelecionado.id === "energetico" && obstaculo > 0 && marioPosition == 0){
                // Faz o energetico sumir ao encostar
                obstaculoSelecionado.style.display = 'none';
    
                // aumenta a velocide da animação dos obstaculos durante 10 segundos (verificação na função selectObstaculo)
                energetico = true;
                setTimeout(()=>{
                    energetico = false;
                }, 10000)
    
            }
        }
    
        // se o personagem colidir com um dos obstaculos, perde o jogo
        if(colidiu){
            // Para o obstaculo
            obstaculoSelecionado.style.animation = 'none';
            obstaculoSelecionado.style.left = `${obstaculo}px`;
    
            // Para o mário
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
    
            // Muda a imagem do mario
            mario.src = './images/game-over.png';
            mario.style.width= '75px'
            mario.style.marginleft = '50px'
    
            // Mostra o texto de derrota
            const gameover = document.getElementById('gameOverText');
            gameover.innerHTML += scoreValue;
            gameover.style.display = 'block';

            clearInterval(loop);
        }
    
        // Adiciona a pontuação 1x caso tenha passado o obstaculo
        else if(obstaculo <= 0){
            if(!pontuou) {
                scoreValue += 1;
                score.innerHTML = "Score: " + scoreValue;
                pontuou = true;
            }
    
            // Espera o obstaculo anterior sair da tela antes de selecionar o proximo
            setTimeout(selectObstaculo, 50);
        }
        
        // reseta o estado de pontuação após incrementar
        if(obstaculo > 0) {
            pontuou = false;
        }
}, 10);

// Espera pelo clique do botao de pause
let botaoPause = document.getElementById('pause');
botaoPause.onclick = ()=>{
    // Para pausar o jogo
    if(!pausado){
        // Pausar as animações com css
        obstaculoSelecionado.style.animationPlayState = 'paused';
        
        pausado = true;
    }
    else{
        obstaculoSelecionado.style.animationPlayState = 'running';
        pausado = false;
    }

}

document.addEventListener('keydown', jump);

