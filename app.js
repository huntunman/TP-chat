var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML
    userName = {};

// Chargement de la page index.html
app.get('/',  (req, res) => {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
    userName[socket.id] = "anonimous";//rajoute le speudo recu a la list de pseudo
    socket.emit('Liste utilisateur', userName);// envoie de la liste de pseudo

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', (pseudo) => {
        pseudo = ent.encode(pseudo);
        userName[socket.id] = pseudo;//rajoute le speudo recu a la list de pseudo
        socket.broadcast.emit('nouveau_client', pseudo);
        socket.emit('Liste utilisateur', userName);// envoie de la liste de pseudo
    });
    socket.on('disconnect', ()=> {
        delete userName[socket.id]
        socket.emit('Liste utilisateur', userName);// envoie de la liste de pseudo
    })

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message',  (message) => {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    });
});

server.listen(3000);
