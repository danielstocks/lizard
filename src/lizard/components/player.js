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
  numPlayers
}) => {
  /* Prison Rules */
  const tricksTobeWon = currentRound + 1;
  const remainingTricksToBeWon =
    scoresheet[currentRound].reduce((accumlatedEstimate, player) => {
      return accumlatedEstimate + player.estimate;
    }, 0) - tricksTobeWon;
  const lastPlayerToEstimate =
    scoresheet[currentRound].length == numPlayers - 1;

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
        marginTop: "20px",
      }}
    >
      <div
        style={{
          marginBottom: "10px",
          padding: "20px",
          background: "peachpuff",
        }}
        key={player}
      >
        <h4 style={{ margin: 0, padding: 0 }}>
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
              <div style={{ marginRight: "10px" }} key={card.value + card.suit}>
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
        {phase == "estimate" &&
          currentPlayer == player &&
          Array.from(Array(currentRound + 2).keys()).map((round) => (
            <button
              key={"estimate" + round}
              disabled={
                lastPlayerToEstimate && remainingTricksToBeWon === round
              }
              onClick={(e) => {
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
