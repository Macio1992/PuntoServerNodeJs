"use strict";

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;
const colors = ["red", "green", "blue", "orange"];
const players = [];
const dictionary = {
  CLIENT: {
    JOIN_GAME: "JoinGame",
    SEND_BOARD_CLIENT: "SendBoardFromClient",
  },
  SERVER: {
    SEND_PLAYERS: "SendPlayers",
    SEND_PLAYER_COLOR: "SendPlayerColor",
    SEND_BOARD_SERVER: "SendBoardFromServer",
  },
};
let serverBoard = [
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
];

const generateRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

function selectColor() {
  const color = colors[generateRandomNumber(0, colors.length)];
  const colorIndex = colors.indexOf(color);

  colors.splice(colorIndex, 1);
  return color;
}

io.on("connection", (socket) => {
  const { clientsCount } = io.engine;
  const { CLIENT, SERVER } = dictionary;
  const { JOIN_GAME, SEND_BOARD_CLIENT } = CLIENT;
  const { SEND_PLAYERS, SEND_PLAYER_COLOR, SEND_BOARD_SERVER } = SERVER;

  if (clientsCount > 4) {
    console.log("4 players are here");
    return;
  }

  io.emit(SEND_PLAYERS, players);

  socket.on(JOIN_GAME, () => {
    const color = selectColor();
    const player = {
      id: socket.id,
      color,
    };

    players.push(player);
    io.emit(SEND_PLAYERS, players);
    socket.emit(SEND_PLAYER_COLOR, player.color);
  });

  socket.on(SEND_BOARD_CLIENT, (board) => {
    serverBoard = board;
    io.emit(SEND_BOARD_SERVER, serverBoard);
  });

  socket.on("disconnect", () => {
    const playerIndex = players.findIndex((p) => p.id === socket.id);

    players.splice(playerIndex, 1);
    io.emit(SEND_PLAYERS, players);
  });
});

http.listen(PORT, () => {
  console.log(`Server is on localhost: ${PORT}`);
});
