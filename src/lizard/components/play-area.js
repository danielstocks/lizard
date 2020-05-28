import React from "react";
import { Card } from "./card";
import { Opponents } from "./opponents";
import { Player } from "./player";

export const PlayArea = ({
  trumpCard,
  plays,
  currentRound,
  playerID,
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
        playerID={playerID}
        phase={phase}
        hand={hand}
        // TODO IF PHASE DEAL ANIMATE DEAL CARDS ELSE DON'T!!!!
      />

      <section
        style={{
          position: "fixed",
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: "0px",
          zIndex: 2,
        }}
      >
        <Player
          phase={phase}
          playCard={playCard}
          estimate={estimate}
          currentPlayer={currentPlayer}
          currentRound={currentRound}
          currentTrick={currentTrick}
          scoresheet={scoresheet}
          plays={plays}
          player={playerID}
          hand={hand}
          numPlayers={numPlayers}
        />
      </section>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, -50%)",
          top: "50%",
          zIndex: 0,
          display: "flex",
          padding: "20px 40px",
          background: "darkseagreen",
          borderRadius: "10px",
        }}
      >
        <div>
          <div
            style={{ position: "relative", height: "150px", width: "110px" }}
          >
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              {trumpCard && (
                <Card value={trumpCard.value} suit={trumpCard.suit} />
              )}
            </div>
          </div>
        </div>
        <div>
          {phase === "play" && (
            <div
              style={{
                marginLeft: "40px",
                width: "105px",
                border: "4px solid green",
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
                        left: 0,
                        top: 0,
                        zIndex: 500,
                        transform: `rotate(${i * 8}deg)`,
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
          )}
        </div>
      </div>
    </div>
  );
};
