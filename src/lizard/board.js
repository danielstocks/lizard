import React from "react";
import { suitSymbols } from "./deck";

const Card = ({ value, suit, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "10px",
      margin: "2px",
      width: "50px",
      textAlign: "center",
      border: "1px solid #eee",
      fontFamily: "serif",
    }}
  >
    {suitSymbols[suit]}&nbsp;{value}
  </div>
);

function getActual(player, round, currentRound, scoresheet) {
  return "-";
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

export const Board = ({ G, ctx, moves }) => {
  const players = Array.from(Array(ctx.numPlayers).keys());
  const rounds = Array.from(Array(G.numberOfRounds).keys());
  const trumpCard = G.trumpCard;

  return (
    <div style={{ maxWidth: "720px", fontFamily: "sans-serif" }}>
      <h1>Lizard</h1>

      <main style={{ display: "flex" }}>
        <section style={{ flex: "1 1 0" }}>
          <h2>Game</h2>
          <p>Current round: {G.currentRound} </p>

          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "10px" }}>
              <strong>Trump Card</strong>
              {trumpCard && (
                <Card value={trumpCard.value} suit={trumpCard.suit} />
              )}
            </div>

            <div>
              <strong>Play Area</strong>

              <div style={{ display: "flex" }}>
                {ctx.phase === "play" &&
                  G.plays[G.currentRound].map((tricks, i) => {
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

          <div style={{ display: "flex" }}>
            {players.map((player) => (
              <div style={{ marginRight: "10px" }} key={player}>
                <h3>
                  Player {player}
                  {ctx.currentPlayer == player && "*"}
                </h3>
                {G.hand[player].map((card, i) => {
                  return (
                    <Card
                      onClick={() => {
                        if (
                          ctx.phase === "play" &&
                          ctx.currentPlayer == player
                        ) {
                          moves.playCard(i);
                        }
                      }}
                      value={card.value}
                      suit={card.suit}
                      key={card.value + card.suit}
                    />
                  );
                })}
                {ctx.phase == "estimate" && ctx.currentPlayer == player && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      moves.estimate(e.target.elements.estimate.value);
                    }}
                  >
                    <input
                      name="estimate"
                      defaultValue="0"
                      size="2"
                      min="0"
                      max={G.currentRound + 1}
                      type="number"
                    />
                    <button>ok</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
        <section>
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
                  <tr>
                    <td rowSpan="2">{round}</td>

                    {players.map((player) => (
                      <React.Fragment key={round + player}>
                        <td rowSpan="2">{getScore()}</td>
                        <td>
                          {getEstimate(
                            player,
                            round,
                            G.currentRound,
                            G.scoresheet
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>

                  <tr>
                    {players.map((player) => (
                      <td key={"actual" + round + player}>{getActual()}</td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};
