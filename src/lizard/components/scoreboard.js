import React from "react";
import { suitSymbols } from "../deck";
import { getPlayerAcummulatedScore } from "../score";

function getActual(player, round, currentRound, scoresheet) {
  if (currentRound < round) {
    return "-";
  }
  if (!scoresheet[round]) {
    return "-";
  }
  if (!scoresheet[round][player]) {
    return "-";
  }
  if (typeof scoresheet[round][player].actual === "undefined") {
    return "-";
  }
  return scoresheet[round][player].actual;
}

function getEstimate(player, round, currentRound, scoresheet) {
  if (currentRound < round) {
    return "-";
  }
  if (!scoresheet[round]) {
    return "-";
  }
  if (!scoresheet[round][player]) {
    return "-";
  }
  return scoresheet[round][player].estimate;
}

export const ScoreBoard = ({
  numPlayers,
  rounds,
  trumpCard,
  currentRound,
  scoresheet,
}) => {
  const players = Array.from(Array(numPlayers).keys());
  const playerScores =
    currentRound > 0
      ? players.map((player) => {
          return getPlayerAcummulatedScore(
            scoresheet.slice(0, currentRound),
            player
          );
        })
      : [];

  return (
    <table
      border="1"
      cellSpacing="0"
      cellPadding="4"
      style={{
        borderCollapse: "collapse",
        fontSize: "11px",
        boxShadow: "1px 1px 12px #555",
      }}
    >
      <thead>
        <tr style={{ background: "white" }}>
          <th>Round</th>
          {players.map((player) => (
            <th colSpan="2" key={"th" + player}>
              Player {player}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rounds.map((round) => (
          <React.Fragment key={round}>
            <tr
              style={{
                background: currentRound === round ? "beige" : "white",
              }}
            >
              <td rowSpan="2">
                {round + 1}&nbsp;
                {currentRound >= round && (
                  <span
                    style={{
                      color:
                        trumpCard[round].suit === "hearts" ||
                        trumpCard[round].suit === "diamonds"
                          ? "red"
                          : "black",
                    }}
                  >
                    {suitSymbols[trumpCard[round].suit]}
                  </span>
                )}
              </td>

              {players.map((player) => (
                <React.Fragment key={round + player}>
                  <td rowSpan="2">
                    {currentRound > 0 && playerScores[player][round]}
                  </td>
                  <td>
                    {getEstimate(player, round, currentRound, scoresheet)}
                  </td>
                </React.Fragment>
              ))}
            </tr>

            <tr
              style={{
                background: currentRound === round ? "beige" : "white",
              }}
            >
              {players.map((player) => (
                <td key={"actual" + round + player}>
                  {getActual(player, round, currentRound, scoresheet)}
                </td>
              ))}
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};
