import React from "react";
import { ScoreBoard } from "./components/scoreboard";
import { Card } from "./components/card";
import { getPlayableCards } from "./play";

function isCardPlayable(card, playableCards) {
  return playableCards.indexOf(card) !== -1;
}

export const Board = ({ G, ctx, moves }) => {
  const players = Array.from(Array(ctx.numPlayers).keys());
  const rounds = Array.from(Array(G.numberOfRounds).keys());
  const trumpCard = G.trumpCard[G.currentRound];

  return (
    <div style={{ maxWidth: "620px", fontFamily: "sans-serif" }}>
      <h1>Lizard</h1>

      <main style={{ display: "flex" }}>
        <section style={{ flex: "1 1 0" }}>
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "10px" }}>
              <strong>Trump Card</strong>
              {trumpCard && (
                <Card value={trumpCard.value} suit={trumpCard.suit} />
              )}
            </div>

            <div>
              <strong>Play Area</strong>

              <div style={{ display: "flex" }}>
                {ctx.phase === "play" &&
                  G.plays[G.currentRound].map((tricks, i) => {
                    return (
                      <div key={i} style={{ marginRight: "5px" }}>
                        <div style={{ fontSize: "10px" }}>trick {i}</div>
                        {tricks.map((card) => {
                          return (
                            <Card
                              value={card.value}
                              suit={card.suit}
                              key={card.value + card.suit}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

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
        <section>
          <ScoreBoard
            trumpCard={G.trumpCard}
            rounds={rounds}
            players={players}
            scoresheet={G.scoresheet}
            currentRound={G.currentRound}
          />
        </section>
      </main>
    </div>
  );
};
