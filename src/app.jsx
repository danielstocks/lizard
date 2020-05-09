import React, { useState } from "react";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { Game, Board } from "./lizard";

const Lizard = Client({
  game: Game,
  board: Board,
  multiplayer: SocketIO({ server: "localhost:8000" }),
  debug: false,
  numPlayers: 3
});

const urlParams = new URLSearchParams(window.location.search);
const urlPlayerID = urlParams.get('player');

const App = () => {
  const [playerID, setPlayerID] = useState(urlPlayerID);

  if (playerID) {
    return (
      <div>
        <Lizard playerID={playerID} />
      </div>
    );
  }
  return (
    <div>
      <p>Play as</p>
      <button onClick={() => setPlayerID("0")}>Player 0</button>
      <button onClick={() => setPlayerID("1")}>Player 1</button>
      <button onClick={() => setPlayerID("2")}>Player 2</button>
    </div>
  );
};

export default App;
