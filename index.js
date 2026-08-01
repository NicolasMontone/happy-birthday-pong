const canvas = document.getElementById('canvas')

canvas.style.background = 'black'
const ctx = canvas.getContext('2d')

const WIDTH = 800
const HEIGHT = 800
const SPEED_UP = 1.05
const PLAYER_SPEED_UP = 1.03
const INITIAL_VEL = 4

// the ball is served from the middle: with the side walls being lethal now,
// the old top-left spawn was an instant game over.
let ballX = WIDTH / 2
let ballY = HEIGHT / 2
const ballRadius = 15
let velX = INITIAL_VEL
let velY = INITIAL_VEL

let hits = 0
let winner = null

const INITIAL_PLAYER_VEL = 15
// paddles speed up alongside the ball so they can keep up with the rally
let playerVel = INITIAL_PLAYER_VEL

const player = {
  x: 50,
  y: 400,
  width: 30,
  height: 200,
  vel: 0,
}

const player2 = {
  x: 800 - 80,
  y: 400,
  width: 30,
  height: 200,
  vel: 0,
}


const happyBirthdayOverC = [0, 0, 2, 0, 5, 4, 0, 0, 2, 0, 7, 5, 0, 0, 12, 9, 5, 5, 4, 2, 10, 10, 9, 5, 7, 5 ].map(note => note + 12 + 3)
let happyBirthdayCurrentNoteIndex = 0

window.addEventListener('keydown', (event) => {
  console.log(event.key)
  if (winner && (event.key === 'r' || event.key === 'R')) {
    restart()
    return
  }

  switch (event.key) {
    case 'w':
      player.vel = -1
      break
    case 's':
      player.vel = 1
      break
    case 'ArrowUp':
      player2.vel = -1
      break
    case 'ArrowDown':
      player2.vel = 1
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 's':
      player.vel = 0
      break
    case 'ArrowUp':
    case 'ArrowDown':
      player2.vel = 0
      break
  }
})
const playerMinY = player.height / 2
const playerMaxY = 800 - player.height / 2

function playNextNote() {
  playSound(getNoteFrequency(happyBirthdayOverC[happyBirthdayCurrentNoteIndex % happyBirthdayOverC.length]))
  happyBirthdayCurrentNoteIndex++
}

function isTouchingPaddle(paddle) {
  return (
    ballX + ballRadius >= paddle.x &&
    ballX - ballRadius <= paddle.x + paddle.width &&
    ballY + ballRadius >= paddle.y - paddle.height / 2 &&
    ballY - ballRadius <= paddle.y + paddle.height / 2
  )
}

function registerHit() {
  hits++
  velX *= SPEED_UP
  velY *= SPEED_UP
  playerVel *= PLAYER_SPEED_UP
  playNextNote()
}

function restart() {
  ballX = WIDTH / 2
  ballY = HEIGHT / 2
  // serve towards whoever just lost
  velX = velX > 0 ? INITIAL_VEL : -INITIAL_VEL
  velY = INITIAL_VEL
  playerVel = INITIAL_PLAYER_VEL
  hits = 0
  winner = null
  happyBirthdayCurrentNoteIndex = 0
  player.y = 400
  player2.y = 400
}

// the ball gets faster on every hit, so a single big jump per frame could
// teleport it through a paddle. move in small slices instead.
function moveBall() {
  const speed = Math.hypot(velX, velY)
  const steps = Math.max(1, Math.ceil(speed / 8))

  for (let i = 0; i < steps && !winner; i++) {
    ballX += velX / steps
    ballY += velY / steps

    if (ballY - ballRadius <= 0) {
      ballY = ballRadius
      velY = Math.abs(velY)
      playNextNote()
    } else if (ballY + ballRadius >= HEIGHT) {
      ballY = HEIGHT - ballRadius
      velY = -Math.abs(velY)
      playNextNote()
    }

    if (velX < 0 && isTouchingPaddle(player)) {
      ballX = player.x + player.width + ballRadius
      velX = Math.abs(velX)
      registerHit()
    } else if (velX > 0 && isTouchingPaddle(player2)) {
      ballX = player2.x - ballRadius
      velX = -Math.abs(velX)
      registerHit()
    }

    if (ballX - ballRadius <= 0) {
      winner = 'PLAYER 2'
    } else if (ballX + ballRadius >= WIDTH) {
      winner = 'PLAYER 1'
    }
  }
}

// clamped rather than rejected: as playerVel grows a single step can overshoot
// the edge, and refusing the whole move would leave the paddle stuck short of it
function movePaddle(paddle) {
  const nextY = paddle.y + playerVel * paddle.vel
  paddle.y = Math.min(Math.max(nextY, playerMinY), playerMaxY)
}

function movePlayers() {
  movePaddle(player)
  movePaddle(player2)
}

function drawHud() {
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'

  ctx.font = 'bold 48px monospace'
  ctx.fillText(hits, WIDTH / 2, 70)

  ctx.font = '16px monospace'
  ctx.fillText('HITS', WIDTH / 2, 95)
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'

  ctx.font = 'bold 64px monospace'
  ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 40)

  ctx.font = '32px monospace'
  ctx.fillText(`${winner} WINS`, WIDTH / 2, HEIGHT / 2 + 10)
  ctx.fillText(`${hits} HITS`, WIDTH / 2, HEIGHT / 2 + 55)

  ctx.font = '20px monospace'
  ctx.fillText('PRESS R TO PLAY AGAIN', WIDTH / 2, HEIGHT / 2 + 110)
}

function drawBall() {
  movePlayers()

  if (!winner) {
    moveBall()
  }

  ctx.clearRect(0, 0, 800, 800)
  ctx.fillStyle = 'white'

  ctx.fillRect(
    player.x,
    player.y - player.height / 2,
    player.width,
    player.height
  )
  ctx.fillRect(
    player2.x,
    player2.y - player2.height / 2,
    player2.width,
    player2.height
  )

  drawHud()

  ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false)
  ctx.fill()

  if (winner) {
    drawGameOver()
  }
}

function animate() {
  drawBall()
  window.requestAnimationFrame(animate)
}

animate()


function getNoteFrequency(semitonesOverA3) {
	const a3 = 110;
	return a3 * (Math.pow(2, semitonesOverA3 / 12));
}
let audioContext 
 const sampleRate = 44100

function initializeAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

   audioContext = new AudioContext();
}
function playSound(frequency) {
  if (!audioContext) return
  const source = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(1, sampleRate, sampleRate);
  const data = buffer.getChannelData(0);
   
  console.log(sampleRate / frequency)
  for (let i = 0; i < 4000; i++) { 
    const counter = i % (sampleRate / frequency * 2)
    if (counter < sampleRate / frequency) {
      data[i] = 1
    } else {
      data[i] = -1
    }
  }
  source.buffer = buffer
  source.connect(audioContext.destination);
  source.start()
}

