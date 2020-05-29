import React from "react";
import { Card } from "./card";
import { Opponents } from "./opponents";

export const PlayArea = ({
  trumpCard,
  plays,
  currentRound,
  player,
  currentPlayer,
  currentTrick,
  phase,
  numPlayers,
  playCard,
  estimate,
  scoresheet,
  hand,
}) => {
  const trick = plays[currentRound][currentTrick];
  return (
    <div>
      <Opponents
        numPlayers={numPlayers}
        currentPlayer={currentPlayer}
        currentRound={currentRound}
        currentTrick={currentTrick}
        scoresheet={scoresheet}
        estimate={estimate}
        plays={plays}
        player={player}
        phase={phase}
        hand={hand}
        playCard={playCard}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, -50%)",
          top: "50%",
          zIndex: 0,
          display: "flex",
          alignItems: "center",
          padding: "20px 40px",
          background: "darkseagreen",
          borderRadius: "10px",
        }}
      >
        <div>
          <div
            style={{ position: "relative", height: "150px", width: "105px" }}
          >
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              {trumpCard && (
                <Card faceDown value={trumpCard.value} suit={trumpCard.suit} />
              )}
            </div>
          </div>
        </div>
        {phase === "play" && (
          <div style={{ marginLeft: "60px" }}>
            <div
              style={{
                width: "105px",
                border: "2px dashed green",
                height: "150px",
                borderRadius: "8px",
              }}
            >
              <div style={{ position: "relative", zIndex: 500 }}>
                {trick.map(({ card }, i) => {
                  return (
                    <div
                      key={card.value + card.suit}
                      style={{
                        position: "absolute",
                        left: 0 + i * 20 + "px",
                        top: 0 + i * 20 + "px",
                        zIndex: 500,
                        transform: `rotate(${2 + i * 10}deg)`,
                      }}
                    >
                      <Card
                        value={card.value}
                        suit={card.suit}
                        key={card.value + card.suit}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
