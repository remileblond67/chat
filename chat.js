var
  app = require('express')(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  ent = require('ent'),
  fs = require('fs');
  nbUser = 0;

// Chargement du fichier index.html affiché au client
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Envoi de fichiers sonores
app.get('/sound/:name', function(req, res) {
  res.sendFile(__dirname + '/sound/'+req.params.name);
});

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket, pseudo) {
  socket.on('newUser', function(pseudo) {
    pseudo = ent.encode(pseudo);
    nbUser++;
    socket.pseudo = pseudo;
    socket.broadcast.emit('newUser', {pseudo: pseudo, nbUser: nbUser});
    console.log('Nouvel utilisateur : ' + pseudo + ' Nb user : '+nbUser);
  });

  socket.on('message', function(message) {
    console.log('Message ('+socket.pseudo+') : '+message);
    message = ent.encode(message);
    socket.broadcast.emit('message', {pseudo:socket.pseudo, message: message, nbUser: nbUser});
  });

  socket.on('bip', function() {
    socket.broadcast.emit('bip');
    console.log('Bip');
  });

  socket.on('disconnect', function(){
    nbUser--;
    console.log(socket.pseudo + ' has disconnected from the chat. Reste '+nbUser);
      socket.broadcast.emit('disconnectUser', {pseudo: socket.pseudo, nbUser: nbUser});
  });
});

server.listen(8080);
