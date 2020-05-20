import React from "react";
import { Card } from "./card";
import { createComponent } from "react-fela";

const container = ({ size }) => ({
  position: "absolute",
  width: size + "em",
  height: size + "em",
  padding: "0",
  borderRadius: "50%",
  listStyle: "none",
  boxSizing: "content-box",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "solid 5px green",
});
const Container = createComponent(container, "div");

const player = ({ size, pos, players, active }) => {
  const spread = 180 / (players - 1);
  const rotate = 180 + pos * spread + "deg";
  const halfSize = size / 2 + "em";

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
    width: size / 4 + "em",
    height: size / 4 + "em",
    margin: "-" + size / 4 / 2 + "em",
    transform: `rotate(${rotate}) translate(${halfSize}) rotate(-${rotate})`,
  };
};

const Player = createComponent(player, "div");

const width = "42";
export const Opponents = ({ currentPlayer, playerID, numPlayers = 3 }) => {
  // Remove PlayerID from list of opponents
  // and render opponents in "correct" order
  const players = Array.from(Array(numPlayers).keys());
  const index = players.indexOf(parseInt(playerID));
  const end = players.slice(index).slice(1);
  const begin = players.slice(0, index);
  const opponents = end.concat(begin);

  return (
    <Container size={width}>
      {opponents.map((player, i) => {
        return (
          <Player
            active={currentPlayer == player}
            key={"player" + player}
            size={width}
            players={opponents.length}
            pos={i}
          >
            <div>Player {player}</div>
          </Player>
        );
      })}
    </Container>
  );
};
