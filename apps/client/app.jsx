import { useState, useRef, useLayoutEffect } from "preact/hooks";

import { isValidPlay } from "../../packages/game"


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

const API_URL = "http://localhost:6060/";

export function App() {
  const [game, setGame] = useState(undefined);
  return (
    <>
      {!game && <Lobby setGame={setGame} />}
      {game && <Game game={game} setGame={setGame} />}
      {game && <Log log={game.log} />}
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


export function Game({ game, setGame }) {

  const { currentRound } = game;

  return (
    <div class="game-screen">
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
            )
            return (
              <div class={currentRound.phase === "PLAY" && validPlay ? "valid-play" : "invalid-play"} onClick={async () => {
                if (currentRound.phase !== "PLAY" || validPlay === false) {
                  return
                }
                const request = await window.fetch(API_URL + "play", {
                  method: "POST",
                  body: JSON.stringify({ gameId: game.id, card }),
                });
                const json = await request.json();
                if (json.error) {
                  alert(json.error);
                } else {
                  setGame(json);
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
          <div class="estimation-title">How many tricks do you think you can win?</div>
          <div class="estimation-buttons">
            {[...Array(currentRound.number + 1).keys()].map(n => (
              <button onClick={async () => {
                const request = await window.fetch(API_URL + "estimate", {
                  method: "POST",
                  body: JSON.stringify({ gameId: game.id, estimate: n }),
                });
                const json = await request.json();
                if (json.error) {
                  alert(json.error);
                } else {
                  setGame(json);
                }
              }}>{n}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Log({ log }) {

  const div = useRef(null)

  useLayoutEffect(() => {
    div.current.scrollTop = div.current.scrollHeight;
  }, [log.length]);

  return (
    <div class="log" ref={div}>
      {log.map(entry => (
        <div>{entry.message}</div>
      ))}
    </div>
  )
}

