import React from "react";
import { Card } from "./card";

export const PlayArea = ({ trumpCard, plays, currentRound, phase }) => (
  <div style={{ display: "flex" }}>
    <div style={{ marginRight: "10px" }}>
    <div style={{ fontSize: "10px" }}>trump</div>
      {trumpCard && <Card value={trumpCard.value} suit={trumpCard.suit} />}
    </div>
    <div>
      <div style={{ display: "flex" }}>
        {phase === "play" &&
          plays[currentRound].map((tricks, i) => {
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
);
