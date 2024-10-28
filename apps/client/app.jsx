import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import { isValidPlay } from "../../packages/game"
import { pluralize } from "../../packages/util"

const API_URL = "//localhost:6060/";

const suits = {
  C: "♣",
  D: "♦",
  H: "♥",
  S: "♠"
}

const colors = {
  C: "black",
  D: "red",
  S: "black",
  H: "red",
}

const eventSource = new EventSource(`${API_URL}sse`, {
  withCredentials: true,
});


export function App() {
  const [game, setGame] = useState(undefined);

  function onEventSourceMessage(event) {
    const data = JSON.parse(event.data);
    if (data.type === "game") {
      //console.log("PHASE", data.payload.currentRound.phase);
      //console.log("CURPLAY", data.payload.currentRound.currentPlayerIndex);
      //console.log("TRICK", data.payload.currentRound.currentTrick);
      //console.log("EST", data.payload.currentRound.playerEstimates);
      //console.log("LOG", data.payload.log.at(-1));
      //console.log("\n");
      // console.log(data.payload.rounds);
      setGame(data.payload);
    }
    if (data.type === "debug") {
      console.log(data.payload.message);
    }
  }

  useEffect(() => {
    eventSource.addEventListener("message", onEventSourceMessage)
    return () => eventSource.removeEventListener("message", onEventSourceMessage)
  }, []);

  return (
    <>
      {!game && <Lobby setGame={setGame} />}
      {game && <Game game={game} setGame={setGame} />}
      {game && <Log log={game.log} players={game.players} />}
    </>
  );
}

export function Lobby({ setGame }) {
  return (
    <div class="lobby-screen">
      <div class="logo">Lizard</div>
      <button class="start-game" onClick={async () => {
        const request = await window.fetch(API_URL + "create-game", {
          method: "POST",
        });
        const json = await request.json();
        setGame(json);
      }}> Start New Game</button >
    </div >
  )
}

export function TinyCard({ card }) {
  if (card === "SNAKE" || card === "LIZARD") {
    return (
      <div class="tiny-card">
        {card === "LIZARD" && "🦎"}
        {card === "SNAKE" && "🐍"}
      </div>
    )
  }
  let suit = card[0];
  let value = card.slice(1);
  return (
    <div class={"tiny-card " + colors[suit]}>
      <span class="suit">{suits[suit]}</span>
      <span class="value">{value}</span>
    </div >
  )
}

export function Card({ card }) {

  if (card === "SNAKE" || card === "LIZARD") {
    return (
      <div class="card">
        {card === "LIZARD" && "🦎"}
        {card === "SNAKE" && "🐍"}
      </div>
    )
  }

  let suit = card[0];
  let value = card.slice(1);

  return (
    <div class={"card " + colors[suit]}>
      <span class="suit">{suits[suit]}</span>
      <span class="value">{value}</span>
    </div>
  )
}


export function Game({ game }) {

  const { currentRound } = game;

  return (
    <div class="game-screen">
      <div class="play-area">
        <div class="logo">Lizard</div>
        <div class="round-stat">
          <div>round: {currentRound.number}</div>
          <div class="trump">
            <div>trump card:</div>
            <TinyCard card={currentRound.trump} />
          </div>
          <div>phase: {currentRound.phase}</div>
        </div>
        <div>current trick:</div>
        <div class="cards">
          {currentRound.currentTrick.map(card => (
            <Card card={card} />
          ))}
        </div>

        <div class="player-hand">
          <div>your hand:</div>
          <div class="cards">
            {currentRound.authenticatedPlayerHand.map(card => {
              let validPlay = isValidPlay(
                card,
                currentRound.authenticatedPlayerHand,
                currentRound.currentTrick
              ) && currentRound.currentPlayerIndex === 0
              return (
                <div class={currentRound.phase === "PLAY" && validPlay ? "valid-play" : "invalid-play"} onClick={async () => {
                  if (currentRound.phase !== "PLAY" || validPlay === false) {
                    return
                  }
                  // TODO: Optimistic update here? Maybe start by just hiding card
                  const request = await window.fetch(API_URL + "play", {
                    method: "POST",
                    body: JSON.stringify({ gameId: game.id, card }),
                  });
                  const json = await request.json();
                  if (json.error) {
                    alert(json.error);
                  } else {
                    //setGame(json);
                  }

                }}>
                  <Card card={card} />
                </div>
              )
            })}
          </div>
        </div>

        {currentRound.currentPlayerIndex === 0 && currentRound.phase === "ESTIMATION" && (
          <div class="estimation">
            <div class="estimation-title">how many tricks do you think you can win?</div>
            <div class="estimation-buttons">
              {[...Array(currentRound.number + 1).keys()].map(n => (
                <button onClick={async () => {
                  // TODO: Optimistic update here? Maybe start by just hiding estimation buttons
                  const request = await window.fetch(API_URL + "estimate", {
                    method: "POST",
                    body: JSON.stringify({ gameId: game.id, estimate: n }),
                  });
                  const json = await request.json();
                  if (json.error) {
                    alert(json.error);
                  } else {
                    //setGame(json);
                  }
                }}>{n}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Scoresheet game={game} />
    </div>
  )
}

function Scoresheet({ game }) {
  return (
    <div class="scoresheet">
      <div class="title">Scoresheet</div>

      <table class="scoresheet-table">

        <thead>
          <tr>
            <th>#</th>
            {game.players.map(player => (
              <th class="player" colspan="2">{player.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>

          {game.rounds.map((round, i) => {

            let agg = round.phase === "DONE" ? game.rounds.slice(0, i + 1)
              .map(round => { return round.scores })
              .reduce((prevScore, score) => {
                return prevScore.map((prev, i) => prev + score[i])
              }, new Array(game.players.length).fill(0)) : []

            return (
              <>

                <tr>
                  <td rowspan="2">{i + 1}</td>

                  {game.players.map((_, i) => {

                    return (
                      <>
                        <td rowspan="2" class="player-score">
                          {agg[i]}
                          {round.phase === "DONE" && (
                            < span className={"indication " + (round.playerEstimates[i] === round.playerTricksWon[i] ? "win" : "lose")}>
                              {round.playerEstimates[i] === round.playerTricksWon[i] ? "✓" : "⤫"}
                            </span >
                          )}
                        </td >
                        <td>{round.playerTricksWon[i]}</td>
                      </>
                    )
                  })}
                </tr >

                <tr>
                  {round.playerEstimates.map(estimate => (
                    <td> {estimate === null ? "-" : estimate}</td>
                  ))}
                </tr >

              </>
            )
          })}
        </tbody>

      </table >
    </div >
  )
}

function CardValue({ card }) {
  switch (card) {
    case "LIZARD": {
      return <span>🦎</span>
    }
    case "SNAKE": {
      return <span>🐍</span>
    }
    default: {
      let value = card.slice(1);
      let suit = card[0];
      return (
        <span class={colors[suit]}>{suits[suit]}{value}</span>
      )
    }
  }
}


function renderLogMessage(entry, players) {
  switch (entry.type) {
    case "LOG": return <div>{entry.payload}</div>
    case "ESTIMATE": return (
      <div>
        <span class="pink">{players[entry.playerIndex].name} </span>
        <span>thinks they can win </span>
        <span class="pink">{entry.payload} </span>
        <span>trick{pluralize(entry.payload)}</span>
      </div>
    )
    case "PLAY": {
      return (
        <div>
          <span class="pink">{players[entry.playerIndex].name} </span>
          <span>played </span>
          <CardValue card={entry.payload} />
        </div>
      )
    }
    case "TRUMP": {
      return (
        <div>
          <span>Trump card is </span>
          <CardValue card={entry.payload} />
        </div>
      )
    }
    default: return null
  }
}

function Log({ log, players }) {
  const div = useRef(null)
  useLayoutEffect(() => {
    div.current.scrollTop = div.current.scrollHeight;
  }, [log.length]);
  return (
    <div class="log" ref={div}>
      {log.map(entry => (
        <div>{renderLogMessage(entry, players)}</div>
      ))}
    </div>
  )
}

