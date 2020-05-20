import { getPlayableCards } from "../core/play";
import { Card } from "./card";
import React from "react";

function isCardPlayable(card, playableCards) {
  return playableCards.indexOf(card) !== -1;
}

export const Player = ({
  phase,
  currentPlayer,
  playCard,
  estimate,
  currentRound,
  scoresheet,
  plays,
  currentTrick,
  hand,
  player,
  numPlayers,
}) => {
  /* Prison Rules */
  const tricksToBeWon = currentRound + 1;
  const tricksTaken = scoresheet[currentRound]
    .filter((item) => item !== null)
    .reduce((accumlatedEstimate, player) => {
      return accumlatedEstimate + player.estimate;
    }, 0);

  const lastPlayerToEstimate =
    scoresheet[currentRound].filter((item) => item !== null).length ==
    numPlayers - 1;

  const remainingTricksToBeWon = tricksToBeWon - tricksTaken;

  let playableCards = [];

  if (phase === "play" && currentPlayer == player) {
    const cardsInPlay = plays[currentRound][currentTrick].map(
      (play) => play.card
    );
    playableCards = getPlayableCards(cardsInPlay, hand[player]);
  }

  const isPlayerTurn = currentPlayer == player;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: "1px 1px 12px #555",
        padding: "20px 40px",
        background: isPlayerTurn ? "peachpuff" : "white",
      }}
    >
      <h4 style={{ margin: 0, padding: "0 0 10px", textAlign: "center" }}>
        Player {player}

      </h4>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        {hand[player].map((card, i) => {
          const cardIsPlayable =
            phase === "play" &&
            currentPlayer == player &&
            isCardPlayable(card, playableCards);
          return (
            <div
              key={card.value + card.suit}
              style={{
                marginRight: i + 1 !== hand[player].length ? "8px" : "0px",
              }}
            >
              <Card
                onClick={() => {
                  if (cardIsPlayable) {
                    playCard(i);
                  }
                }}
                playable={cardIsPlayable}
                disabled={!cardIsPlayable}
                value={card.value}
                suit={card.suit}
              />
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
        {phase == "estimate" &&
          currentPlayer == player &&
          Array.from(Array(currentRound + 2).keys()).map((round) => (
            <button
              key={"estimate" + round}
              disabled={
                lastPlayerToEstimate && remainingTricksToBeWon === round
              }
              onClick={() => {
                estimate(round);
              }}
            >
              {round}
            </button>
          ))}
      </div>
    </div>
  );
};
