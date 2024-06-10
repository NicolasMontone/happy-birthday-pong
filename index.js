const canvas = document.getElementById('canvas')

canvas.style.background = 'black'
const ctx = canvas.getContext('2d')

let ballX = 50
let ballY = 15
const ballRadius = 15
let velX = 4
let velY = 4

const playerVel = 15

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

function drawBall() {
  ballX += velX
  ballY += velY

  const nextPlayerY = player.y + playerVel * player.vel

  if (nextPlayerY > playerMinY && nextPlayerY < playerMaxY) {
    player.y = nextPlayerY
  }

  const nextPlayer2Y = player2.y + playerVel * player2.vel

  if (nextPlayer2Y > playerMinY && nextPlayer2Y < playerMaxY) {
    player2.y = nextPlayer2Y
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
  ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`
  // ctx.fillRect(ballX, ballY, ballRadius * 2, ballRadius * 2)
  ctx.beginPath()
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, false)
  ctx.fill()

  const isBallTouchingEdges = ballX > 800 - ballRadius * 2 || ballX < 0

  const isTouchingPlayer =
    (ballX < player.x + player.width &&
      ballY > player.y - player.height - ballRadius &&
      ballY < player.y + player.height + ballRadius) ||
    (ballX > player2.x - player2.width &&
      ballY > player2.y - player2.height - ballRadius &&
      ballY < player2.y + player2.height + ballRadius)

  if (isBallTouchingEdges || isTouchingPlayer) {    
    playSound(getNoteFrequency(happyBirthdayOverC[happyBirthdayCurrentNoteIndex % happyBirthdayOverC.length]))
    happyBirthdayCurrentNoteIndex++

    velX *= -1
  }

  const isBallTouchingTopOrBottom = ballY > 800 - ballRadius * 2 || ballY < 0

  if (isBallTouchingTopOrBottom) {
    playSound(getNoteFrequency(happyBirthdayOverC[happyBirthdayCurrentNoteIndex % happyBirthdayOverC.length]))
    happyBirthdayCurrentNoteIndex++
    velY *= -1
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

