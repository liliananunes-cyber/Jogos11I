const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const bgMusic = document.getElementById('bgMusic')
bgMusic.volume = 0.3 // volume mais baixo

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: { x: 600, y: 128 },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: { x: 100, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: { x: 215, y: 157 },
  sprites: {
    idle: { imageSrc: './img/samuraiMack/Idle.png', framesMax: 8 },
    run: { imageSrc: './img/samuraiMack/Run.png', framesMax: 8 },
    jump: { imageSrc: './img/samuraiMack/Jump.png', framesMax: 2 },
    fall: { imageSrc: './img/samuraiMack/Fall.png', framesMax: 2 },
    attack1: { imageSrc: './img/samuraiMack/Attack1.png', framesMax: 6 },
    takeHit: { imageSrc: './img/samuraiMack/Take Hit - white silhouette.png', framesMax: 4 },
    death: { imageSrc: './img/samuraiMack/Death.png', framesMax: 6 }
  },
  attackBox: {
    offset: { x: 100, y: 50 },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: { x: 900, y: 0 },
  velocity: { x: 0, y: 0 },
  color: 'blue',
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: { x: 215, y: 167 },
  sprites: {
    idle: { imageSrc: './img/kenji/Idle.png', framesMax: 4 },
    run: { imageSrc: './img/kenji/Run.png', framesMax: 8 },
    jump: { imageSrc: './img/kenji/Jump.png', framesMax: 2 },
    fall: { imageSrc: './img/kenji/Fall.png', framesMax: 2 },
    attack1: { imageSrc: './img/kenji/Attack1.png', framesMax: 4 },
    takeHit: { imageSrc: './img/kenji/Take hit.png', framesMax: 3 },
    death: { imageSrc: './img/kenji/Death.png', framesMax: 7 }
  },
  attackBox: {
    offset: { x: -170, y: 50 },
    width: 170,
    height: 50
  }
})

let gamePaused = false
let animationId
let playerJumpCount = 0
let enemyJumpCount = 0

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false }
}

decreaseTimer()

function animate() {
  if (gamePaused) return

  animationId = window.requestAnimationFrame(animate)
  
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // Reset pulo duplo ao tocar o chão (ajuste o Y se necessário)
  if (player.velocity.y === 0) playerJumpCount = 0
  if (enemy.velocity.y === 0) enemyJumpCount = 0

  // Player Movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy Movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // Colisões e Dano
  if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking && player.framesCurrent === 4) {
    enemy.takeHit()
    player.isAttacking = false
    gsap.to('#enemyHealth', { width: enemy.health + '%' })
  }

  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking && enemy.framesCurrent === 2) {
    player.takeHit()
    enemy.isAttacking = false
    gsap.to('#playerHealth', { width: player.health + '%' })
  }

  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // Fim de jogo baseado em vida
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
    finishGameUI()
  }
}

animate()

const pauseMenu = document.getElementById('pauseMenu')
const resumeBtn = document.getElementById('resumeBtn')
const restartBtn = document.getElementById('restartBtn')
const pauseTitle = document.getElementById('pauseTitle')

// Função auxiliar para exibir a tela final com o vencedor
function finishGameUI() {
  bgMusic.pause()
  bgMusic.currentTime = 0

  gamePaused = true
  cancelAnimationFrame(animationId)
  pauseMenu.style.display = 'flex'
  resumeBtn.style.display = 'none'

  if (player.health === enemy.health) {
    pauseTitle.innerText = '🏁 EMPATE!'
  } else if (player.health > enemy.health) {
    pauseTitle.innerText = '🏁 JOGADOR 1 VENCEU!'
  } else {
    pauseTitle.innerText = '🏁 JOGADOR 2 VENCEU!'
  }
}


function togglePause() {
  if (player.health <= 0 || enemy.health <= 0) return
  gamePaused = !gamePaused
  if (gamePaused) {
    cancelAnimationFrame(animationId)
    pauseMenu.style.display = 'flex'
    pauseTitle.innerText = '⏸ PAUSADO'
  } else {
    pauseMenu.style.display = 'none'
    animate()
  }
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') togglePause()
  if (gamePaused) return 

  if (!player.dead) {
    switch (event.key) {
      case 'd': keys.d.pressed = true; player.lastKey = 'd'; break
      case 'a': keys.a.pressed = true; player.lastKey = 'a'; break
      case 'w': 
        if (playerJumpCount < 2) {
          player.velocity.y = -15
          playerJumpCount++
        }
        break
      case ' ': player.attack(); break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight': keys.ArrowRight.pressed = true; enemy.lastKey = 'ArrowRight'; break
      case 'ArrowLeft': keys.ArrowLeft.pressed = true; enemy.lastKey = 'ArrowLeft'; break
      case 'ArrowUp': 
        if (enemyJumpCount < 2) {
          enemy.velocity.y = -15
          enemyJumpCount++
        }
        break
      case 'ArrowDown': enemy.attack(); break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd': keys.d.pressed = false; break
    case 'a': keys.a.pressed = false; break
    case 'ArrowRight': keys.ArrowRight.pressed = false; break
    case 'ArrowLeft': keys.ArrowLeft.pressed = false; break
  }
})

resumeBtn.addEventListener('click', togglePause)
restartBtn.addEventListener('click', () => window.location.reload())

// ... (mantenha todo o seu código anterior de classes e animate)

const startMenu = document.getElementById('startMenu')
const startBtn = document.getElementById('startBtn')

// O jogo começa "pausado" para não rodar atrás do menu inicial
gamePaused = true 

startBtn.addEventListener('click', () => {
  startMenu.style.display = 'none'
  gamePaused = false
  bgMusic.play()
  animate() // Inicia o loop de animação
  // Se o decreaseTimer não for chamado automaticamente, chame-o aqui:
  // decreaseTimer() ~
  
})

// Ajuste na função togglePause para não abrir a pausa se o menu inicial estiver visível
function togglePause() {
  if (startMenu.style.display !== 'none') return // Impede pausa no menu inicial
  if (player.health <= 0 || enemy.health <= 0) return
  
  gamePaused = !gamePaused
  if (gamePaused) {
    cancelAnimationFrame(animationId)
    pauseMenu.style.display = 'flex'
    pauseTitle.innerText = '⏸ PAUSADO'
    bgMusic.pause()
  } else {
    pauseMenu.style.display = 'none'
    bgMusic.play()
    animate()
  }
  
}