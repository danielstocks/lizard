import React from "react";
import { Client } from "boardgame.io/react";
import { Game, Board } from "./lizard";

const Lizard = Client({ game: Game, board: Board, numPlayers: 4 });

const App = () => (
  <div>
    <Lizard />
  </div>
);

export default App;
