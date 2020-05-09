import React from "react";
import { Card } from "./card";

export const PlayArea = ({
  trumpCard,
  plays,
  currentRound,
  currentTrick,
  phase,
  numPlayers
}) => {
  const trick = plays[currentRound][currentTrick];
  return (
    <div
      style={{
        display: "flex",
        padding: "20px 40px",
        background: "darkseagreen",
      }}
    >
      <div style={{ marginRight: "40px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          trump
        </div>
        {trumpCard && <Card value={trumpCard.value} suit={trumpCard.suit} />}
      </div>
      <div>
        {phase === "play" && (
          <div style={{ width: 90 * numPlayers + "px"}}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              trick {currentTrick}
            </div>
            <div style={{ display: "flex" }}>
              {trick.map((card) => {
                return (
                  <Card
                    value={card.value}
                    suit={card.suit}
                    key={card.value + card.suit}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
