function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId)
  // Ocultamos o displayText original pois agora usamos o pauseMenu para o resultado
  document.querySelector('#displayText').style.display = 'none'
}

let timer = 60
let timerId

function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000)
    if (!gamePaused) {
      timer--
      document.querySelector('#timer').innerHTML = timer
    }
  }

  if (timer === 0) {
    // Quando o tempo acaba, chamamos a função de UI do index.js via flag global ou lógica direta
    // Para simplificar, o animate() do index.js cuidará de exibir a tela se gamePaused for true
    gamePaused = true
    // Chamamos a função de UI (esta função precisa estar acessível)
    if(typeof finishGameUI === 'function') finishGameUI()
  }
}