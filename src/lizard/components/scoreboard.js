import React from "react";
import { suitSymbols } from "../deck";

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

function getScore(player, round, currentRound, scoresheet) {
  return "-";
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
  players,
  rounds,
  trumpCard,
  currentRound,
  scoresheet,
}) => (
  <>
    <h2>Scoresheet</h2>
    <table
      border="1"
      cellSpacing="0"
      cellPadding="4"
      style={{ borderCollapse: "collapse", fontSize: "11px" }}
    >
      <thead>
        <tr>
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
                {round}&nbsp;
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
                  <td rowSpan="2">{getScore()}</td>
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
  </>
);
