const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  // Send initial time and finger state
  sendClockAndFingers(socket);

  // Send update every second
  const interval = setInterval(() => {
    sendClockAndFingers(socket);
  }, 1000);

  socket.on('disconnect', () => clearInterval(interval));
});

function sendClockAndFingers(socket) {
  const now = new Date();
  const showFingers = Math.floor(now.getSeconds() / 15) % 2 === 0;
  socket.emit('clock', {
    time: now.toLocaleTimeString(),
    showFingers
  });
}

server.listen(PORT, () => {
  console.log(`ClockFingers app listening at http://localhost:${PORT}`);
});
