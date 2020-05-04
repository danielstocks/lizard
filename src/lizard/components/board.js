import React from "react";
import { ScoreBoard } from "./scoreboard";
import { Card } from "./card";
import { Console } from "./console";
import { PlayArea } from "./play-area";
import { getPlayableCards } from "../play";

function isCardPlayable(card, playableCards) {
  return playableCards.indexOf(card) !== -1;
}

export const Board = ({ G, ctx, moves }) => {
  const players = Array.from(Array(ctx.numPlayers).keys());
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

        <div style={{ display: "flex" }}>
          {players.map((player) => {
            let playableCards = [];

            if (ctx.phase === "play" && ctx.currentPlayer == player) {
              const cardsInPlay = G.plays[G.currentRound][G.currentTrick];
              playableCards = getPlayableCards(cardsInPlay, G.hand[player]);
            }

            return (
              <div style={{ marginRight: "10px" }} key={player}>
                <h3>
                  Player {player}
                  {ctx.currentPlayer == player && "*"}
                </h3>
                {G.hand[player].map((card, i) => {
                  const cardIsPlayable =
                    ctx.phase === "play" &&
                    ctx.currentPlayer == player &&
                    isCardPlayable(card, playableCards);
                  return (
                    <Card
                      onClick={() => {
                        if (cardIsPlayable) {
                          moves.playCard(i);
                        }
                      }}
                      disabled={!cardIsPlayable}
                      value={card.value}
                      suit={card.suit}
                      key={card.value + card.suit}
                    />
                  );
                })}
                {ctx.phase == "estimate" && ctx.currentPlayer == player && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      moves.estimate(e.target.elements.estimate.value);
                    }}
                  >
                    <input
                      name="estimate"
                      defaultValue="0"
                      size="2"
                      min="0"
                      max={G.currentRound + 1}
                      type="number"
                    />
                    <button>ok</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ position: "absolute", top: "10px", right: "10px" }}>
        <ScoreBoard
          trumpCard={G.trumpCard}
          rounds={rounds}
          players={players}
          scoresheet={G.scoresheet}
          currentRound={G.currentRound}
        />
      </section>
      <section style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: -1}}>
        <Console log={G.log} />
      </section>
    </div>
  );
};
