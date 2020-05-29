import React, { useEffect } from "react";
import { ScoreBoard } from "./scoreboard";
import { Console } from "./console";
import { PlayArea } from "./play-area";

export const Board = ({ G, ctx, moves, playerID }) => {
  const rounds = Array.from(Array(G.numberOfRounds).keys());
  const trumpCard = G.trumpCard[G.currentRound];

  
  useEffect(() => {
    document.title = `Lizard - Player ${playerID}`;
  });

  return (
    <div>
      <section>
        <PlayArea
          player={parseInt(playerID)}
          trumpCard={trumpCard}
          currentPlayer={parseInt(ctx.currentPlayer)}
          currentRound={G.currentRound}
          currentTrick={G.currentTrick}
          phase={ctx.phase}
          numPlayers={ctx.numPlayers}
          playCard={moves.playCard}
          estimate={moves.estimate}
          hand={G.hand}
          plays={G.plays}
          scoresheet={G.scoresheet}
        />
      </section>

      <section
        style={{
          position: "fixed",
          overflowY: "scroll",
          top: "10px",
          right: "10px",
          bottom: "0px",
        }}
      >
        <ScoreBoard
          trumpCard={G.trumpCard}
          rounds={rounds}
          currentPlayer={ctx.currentPlayer}
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
