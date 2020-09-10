const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
})

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peer', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.render('room', { roomId });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log('joined room', roomId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });

    socket.on('message', (userId, message) => {
      console.log('message arrived', userId, message);
      io.to(roomId).emit('user-message', userId, message);
    })
  });
});

server.listen(3030);
