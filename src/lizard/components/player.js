import { getPlayableCards } from "../play";
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
  const tricksTaken =
    scoresheet[currentRound].reduce((accumlatedEstimate, player) => {
      return accumlatedEstimate + player.estimate;
    }, 0);
  const lastPlayerToEstimate =
    scoresheet[currentRound].length == numPlayers - 1;
  const remainingTricksToBeWon = tricksToBeWon - tricksTaken

  let playableCards = [];
  if (phase === "play" && currentPlayer == player) {
    const cardsInPlay = plays[currentRound][currentTrick];
    playableCards = getPlayableCards(cardsInPlay, hand[player]);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: "1px 1px 12px #555",
        padding: "20px 40px",
        background: "peachpuff",
      }}
    >
      <h4 style={{ margin: 0, padding: "0 0 10px", textAlign: "center" }}>
        Player {player}
        {currentPlayer == player && "*"}
      </h4>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        {hand[player].map((card, i) => {
          const cardIsPlayable =
            phase === "play" &&
            currentPlayer == player &&
            isCardPlayable(card, playableCards);
          return (
            <div key={card.value + card.suit}>
              <Card
                onClick={() => {
                  if (cardIsPlayable) {
                    playCard(i);
                  }
                }}
                disabled={!cardIsPlayable}
                value={card.value}
                suit={card.suit}
              />
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center" }}>
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
