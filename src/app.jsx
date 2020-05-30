import React, { useState } from "react";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { Game, Board } from "./lizard";
import { RendererProvider } from "react-fela";
import { createRenderer } from "fela";
import { Div } from "./lizard/components/layout";
import { NAMES } from "./lizard/core/player";
const renderer = createRenderer();

const Lizard = Client({
  game: Game,
  board: Board,
  multiplayer: SocketIO({ server: "localhost:8000" }),
  debug: false,
  numPlayers: 3,
});

const urlParams = new URLSearchParams(window.location.search);
const urlPlayerID = urlParams.get("player");

const App = () => {
  const [playerID, setPlayerID] = useState(urlPlayerID);
  const [playerName, setPlayerName] = useState("");

  if (playerID) {
    return (
      <RendererProvider renderer={renderer}>
        <Lizard playerID={playerID} />
      </RendererProvider>
    );
  }
  return (
    <RendererProvider renderer={renderer}>
      <Div extend={{ padding: "20px" }}>
        <Div extend={{ color: "#fff" }} as="h1">
          Lizard Lobby
        </Div>

        <Div as="label" extend={{ color: "#fff" }}>
          Your Alias:
          <input
            type="text"
            name="playerName"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
            }}
          />
        </Div>
        <button onClick={() => {


        
        setPlayerName(NAMES[Math.floor(Math.random() * NAMES.length)]);


        }}>suggest</button>
 
        <Div extend={{ color: "#fff" }} as="h2">
          Play as:
        </Div>
        <button onClick={() => setPlayerID("0")}>Player 0</button>
        <button onClick={() => setPlayerID("1")}>Player 1</button>
        <button onClick={() => setPlayerID("2")}>Player 2</button>
        <button onClick={() => setPlayerID("3")}>Player 3</button>
      </Div>
    </RendererProvider>
  );
};

export default App;
