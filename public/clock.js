const canvas = document.getElementById('analogClock');
const ctx = canvas.getContext('2d');
const radius = canvas.height / 2;
ctx.translate(radius, radius);

function drawClock(time) {
  ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
  // Blinking logic
  let blink = false;
  let minuteDisplay = time.getMinutes();
  if (window.minuteCounterActive) {
    const intervalMs = (window.minuteCounterInterval || 1) * 1000;
    const elapsed = Date.now() - window.minuteCounterStart;
    window.minuteCounterValue = Math.floor(elapsed / intervalMs);
    minuteDisplay = window.minuteCounterValue;
    // Time left in current interval
    const timeLeft = intervalMs - (elapsed % intervalMs);
    if (timeLeft <= 3000) {
      // Blink every 500ms in last 3 seconds
      blink = Math.floor(timeLeft / 250) % 2 === 0;
    }
  }
  drawFace(ctx, radius, blink);
  drawNumbers(ctx, radius);
  drawQuarterHands(ctx, radius);
  drawSecondHand(ctx, radius, time);
  drawMinuteNumber(ctx, radius, { getMinutes: () => minuteDisplay });
// Draw the current minute number in the center
function drawMinuteNumber(ctx, radius, time) {
  ctx.save();
  ctx.font = `${radius * 0.4}px arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  // Move the number further downward (e.g., 35% of radius)
  ctx.fillText(time.getMinutes().toString(), 0, radius * 0.35);
  ctx.restore();
}
// Draw four hands at 0, 15, 30, 45 seconds in different colors
// Draw four rotating hands ("fingers") at different speeds
function drawQuarterHands(ctx, radius) {
  const now = new Date();
  const ms = now.getMilliseconds();
  let s = now.getSeconds() + ms / 1000;
  // Apply red finger offset if set
  if (window.redFingerOffset) {
    s = (s + window.redFingerOffset) % 60;
  }
  // Order: red, darker grey (for contrast), green, white
  const colors = ['red', '#888888', 'green', 'white'];
  // All hands: same width and length
  const handWidth = radius * 0.09;
  const handLength = radius * 0.9;
  for (let i = 0; i < 4; i++) {
    let offset = i * 15; // seconds
    let angle = (((s + offset) % 60) / 60) * 2 * Math.PI;
    drawHand(ctx, angle, handLength, handWidth, colors[i]);
  }
}
}

function drawFace(ctx, radius, blink) {
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI);
  ctx.fillStyle = blink ? '#fff' : '#000';
  ctx.fill();
  ctx.strokeStyle = blink ? '#000' : '#fff';
  ctx.lineWidth = radius * 0.01;
  ctx.stroke();
  // Draw small tick marks for every second
  for (let i = 0; i < 60; i++) {
    let angle = (i * Math.PI / 30);
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.92);
    ctx.lineTo(0, -radius * 0.85);
    ctx.lineWidth = (i % 5 === 0) ? 3 : 1;
    ctx.strokeStyle = blink ? (i % 5 === 0 ? '#000' : '#444') : (i % 5 === 0 ? '#fff' : '#888');
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = blink ? '#000' : '#fff';
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num <= 12; num++) {
    let ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.8);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.8);
    ctx.rotate(-ang);
  }
}


function drawSecondHand(ctx, radius, time) {
  let second = time.getSeconds() + time.getMilliseconds() / 1000;
  let angle = (second * Math.PI / 30);
  // Match the quarter hands' style
  const handWidth = radius * 0.09;
  const handLength = radius * 0.9;
  drawHand(ctx, angle, handLength, handWidth, 'red');
}

function drawHand(ctx, pos, length, width, color) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

function updateClock() {
  drawClock(new Date());
  requestAnimationFrame(updateClock);
  // Reset override after one frame
  if (window.manualMinuteReset) {
    setTimeout(() => { window.manualMinuteReset = false; }, 100);
  }
}

updateClock();
