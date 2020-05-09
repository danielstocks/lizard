import React from "react";
import { ScoreBoard } from "./scoreboard";
import { Console } from "./console";
import { PlayArea } from "./play-area";
import { Player } from "./player";

export const Board = ({ G, ctx, moves, playerID }) => {
  const rounds = Array.from(Array(G.numberOfRounds).keys());
  const trumpCard = G.trumpCard[G.currentRound];

  return (
    <div>
      <section style={{ position: "absolute", left: 10, top: 10 }}>
        <PlayArea
          trumpCard={trumpCard}
          plays={G.plays}
          currentRound={G.currentRound}
          phase={ctx.phase}
        />
        <Player
          phase={ctx.phase}
          playCard={moves.playCard}
          estimate={moves.estimate}
          currentPlayer={ctx.currentPlayer}
          currentRound={G.currentRound}
          currentTrick={G.currentTrick}
          scoresheet={G.scoresheet}
          plays={G.plays}
          player={playerID}
          hand={G.hand}
          numPlayers={ctx.numPlayers}
        />
      </section>

      <section style={{ position: "absolute", top: "10px", right: "10px" }}>
        <ScoreBoard
          trumpCard={G.trumpCard}
          rounds={rounds}
          numPlayers={ctx.numPlayers}
          scoresheet={G.scoresheet}
          currentRound={G.currentRound}
        />
      </section>
      <section
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          zIndex: -1,
        }}
      >
        <Console log={G.log} />
      </section>
    </div>
  );
};
