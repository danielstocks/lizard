import React from "react";
import { Card } from "./card";
import { useFela, createComponent } from "react-fela";

const translateKeyframe = ({ x, y }) => ({
  "0%": { transform: `translate(0px, 0px)` },
  "100%": { transform: `translate(${x}px, ${y}px)` },
});

const SIZE = 640;
const DELAY = 200;

const Div = createComponent({}, "div");

const container = ({ size }) => ({
  position: "absolute",
  width: size + "px",
  height: size + "px",
  padding: "0",
  borderRadius: "50%",
  listStyle: "none",
  boxSizing: "content-box",
  zIndex: 1,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "solid 5px green",
});
const Container = createComponent(container, "div");

const player = ({ size, pos, players, active }) => {

  const spread = 180 / (players - 1);
  const rotate = 180 + pos * spread + "deg";
  const halfSize = size / 2 + "px";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "peachpuff" : "white",
    fontWeight: active ? "bold" : "normal",
    borderRadius: "50%",
    position: "absolute",
    top: "50%",
    left: "50%",
    width: size / 6 + "px",
    height: size / 6 + "px",
    margin: "-" + size / 6 / 2 + "px",
    transform: `rotate(${rotate}) translate(${halfSize}) rotate(-${rotate})`,
  };
};

const Player = createComponent(player, "div");

export const Opponents = ({
  currentPlayer,
  playerID,
  numPlayers = 3,
  hand,
  phase,
}) => {
  // Remove PlayerID from list of opponents
  // and render opponents in "correct" order
  const players = Array.from(Array(numPlayers).keys());
  const index = players.indexOf(parseInt(playerID));
  const end = players.slice(index).slice(1);
  const begin = players.slice(0, index);
  const opponents = end.concat(begin);

  const currentPlayerID = parseInt(playerID);

  const { renderer } = useFela();

  return (
    <>
      {hand[playerID].map((card, i) => {

          const delay =
            DELAY * numPlayers * (i + 1) +
            DELAY * (currentPlayerID + 1) -
            (DELAY * numPlayers + DELAY);

          const animationDelay = delay + "ms";

          return (
            <Div
              key={card.value + card.suit}
              extend={{
                position: "absolute",
                top: "50%",
                left: "50%",
                zIndex: 100 - playerID,
                transform: "translate(-50%, -50%)",
              }}
            >
              <Div
                extend={{
                  animationName: renderer.renderKeyframe(translateKeyframe, {
                    x: 0 + i * 80,
                    y: 564,
                  }),
                  animationDuration: "0.5s",
                  animationFillMode: "forwards",
                  animationDelay,
                }}
              >
                <Card value={card.value} suit={card.suit} />
              </Div>
            </Div>
          );
        })}

      <Container size={SIZE} extend={{ zIndex: 100 }}>
        {opponents.map((player, i) => {
          const active = currentPlayer == player;
          const spread = 180 / 3;
          const degrees = 180 + i * spread;
          const angle = (degrees * Math.PI) / 180;
          let x = Math.cos(angle) * ( SIZE / 2)
          let y = Math.sin(angle) * ( SIZE / 2);

          return (
            <React.Fragment key={"player" + player}>
              {hand[player].map((card, n) => {
                const delay =
                  DELAY * numPlayers * (n + 1) +
                  DELAY * (player + 1) -
                  (DELAY * numPlayers + DELAY);

                const animationDelay = delay + "ms";

                return (
                  <Div
                    key={"card" + player + n}
                    extend={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      zIndex: 100 - i,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Div
                      extend={{
                        animationName: renderer.renderKeyframe(
                          translateKeyframe,
                          {
                            x: x + n * 3,
                            y: y + n * 3,
                          }
                        ),
                        animationDuration: "0.5s",
                        animationFillMode: "forwards",
                        animationDelay,
                      }}
                    >
                      <Card faceDown />
                    </Div>
                  </Div>
                );
              })}

              <Player
                active={active}
                size={SIZE}
                players={opponents.length}
                pos={i}
              >
                <Div
                  extend={{
                    position: "absolute",
                    top: "-75px",
                    background: active ? "peachpuff" : "white",
                    padding: "6px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  Player {player}
                </Div>
              </Player>
            </React.Fragment>
          );
        })}
      </Container>
    </>
  );
};
