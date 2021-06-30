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
    SEND_CARDS_CLIENT: "SendCardsFromClient",
    SEND_NEXT_PLAYER_CLIENT: "SendNextPlayer",
  },
  SERVER: {
    SEND_PLAYERS: "SendPlayers",
    SEND_PLAYER_COLOR: "SendPlayerColor",
    SEND_BOARD_SERVER: "SendBoardFromServer",
    SEND_ACTIVE_PLAYER_SERVER: "SendActivePlayer",
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

const playersCards = {
  red: {},
  green: {},
  blue: {},
  orange: {},
};

let activePlayer;

const generateRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

function selectColor() {
  const color = colors[generateRandomNumber(0, colors.length)];
  const colorIndex = colors.indexOf(color);

  colors.splice(colorIndex, 1);
  return color;
}

io.on("connection", (socket) => {
  const { CLIENT, SERVER } = dictionary;
  const {
    JOIN_GAME,
    SEND_BOARD_CLIENT,
    SEND_CARDS_CLIENT,
    SEND_NEXT_PLAYER_CLIENT,
  } = CLIENT;
  const {
    SEND_PLAYERS,
    SEND_PLAYER_COLOR,
    SEND_BOARD_SERVER,
    SEND_ACTIVE_PLAYER_SERVER,
  } = SERVER;

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

    activePlayer = color;
    io.emit(SEND_ACTIVE_PLAYER_SERVER, activePlayer);
  });

  socket.on(SEND_BOARD_CLIENT, (board) => {
    serverBoard = board;
    io.emit(SEND_BOARD_SERVER, serverBoard);
  });

  socket.on(SEND_CARDS_CLIENT, (cardsByPlayer) => {
    const { color, cards } = cardsByPlayer;
    playersCards[color] = cards;
  });

  socket.on(SEND_NEXT_PLAYER_CLIENT, () => {
    const activePlayerIndex = players.findIndex(
      (p) => p.color === activePlayer
    );
    const nextPlayerIndex =
      activePlayerIndex === players.length - 1 ? 0 : activePlayerIndex + 1;
    const nextPlayer = players[nextPlayerIndex].color;

    activePlayer = nextPlayer;

    io.emit(SEND_ACTIVE_PLAYER_SERVER, activePlayer);
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
