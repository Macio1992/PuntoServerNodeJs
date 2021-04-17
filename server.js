'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

const PORT = process.env.PORT || 3000;
const colors = ['red', 'green', 'blue', 'orange'];
const players = [];

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function selectColor() {
    const color = colors[generateRandomNumber(0, colors.length)];
    const colorIndex = colors.indexOf(color);

    colors.splice(colorIndex, 1);
    return color;
}

io.on("connection", socket => {
    const { clientsCount } = io.engine;

    if (clientsCount > 4) {
        console.log('4 players are here');
        return;
    }

    io.emit('send players', players);

    socket.on('create player', gamerName => {
        const player = {
            id: socket.id,
            playerName: gamerName,
            color: selectColor()
        };
        players.push(player);
        io.emit('send players', players);
        console.log('Players ', players);
        console.log('colors ', colors);
    });

    socket.on('disconnect', () => {
        const player = players.find(p => p.id === socket.id);
        const playerIndex = players.findIndex(p => p.id === socket.id);

        players.splice(playerIndex, 1);
        io.emit('send players', players);
    });
});

http.listen(PORT, () => {
    console.log(`Server is on localhost: ${PORT}`);
});
