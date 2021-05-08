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
const dictionary = {
    CLIENT: {
        JOIN_GAME: 'JoinGame',
    },
    SERVER: {
        SEND_PLAYERS: 'SendPlayers',
        SEND_PLAYER_COLOR: 'SendPlayerColor',
    }
};

const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function selectColor() {
    const color = colors[generateRandomNumber(0, colors.length)];
    const colorIndex = colors.indexOf(color);

    colors.splice(colorIndex, 1);
    return color;
}

io.on("connection", socket => {
    const { clientsCount } = io.engine;
    const { CLIENT, SERVER } = dictionary;
    const { JOIN_GAME } = CLIENT;
    const { SEND_PLAYERS, SEND_PLAYER_COLOR } = SERVER;

    if (clientsCount > 4) {
        console.log('4 players are here');
        return;
    }

    io.emit(SEND_PLAYERS, players);

    socket.on(JOIN_GAME, () => {
        const color = selectColor();
        const player = {
            id: socket.id,
            color
        };
        players.push(player);
        io.emit(SEND_PLAYERS, players);
        socket.emit(SEND_PLAYER_COLOR, player.color);
        console.log('Players ', players);
        console.log('colors ', colors);
    });

    socket.on('disconnect', () => {
        const playerIndex = players.findIndex(p => p.id === socket.id);

        players.splice(playerIndex, 1);
        io.emit(SEND_PLAYERS, players);
    });
});

http.listen(PORT, () => {
    console.log(`Server is on localhost: ${PORT}`);
});
