import { useState } from "preact/hooks";

const suits = {
  C: "♣",
  D: "♦",
  H: "♥",
  S: "♠"
}

const API_URL = "http://localhost:6060/";

export function App() {
  const [game, setGame] = useState(undefined);
  return (
    <>
      <div>Lizard</div>
      {!game && <Lobby setGame={setGame} />}
      {game && <Game game={game} setGame={setGame} />}
    </>
  );
}

export function Lobby({ setGame }) {
  return (
    <div>
      <button onClick={async () => {
        const request = await window.fetch(API_URL + "create-game", {
          method: "POST",
        });
        const json = await request.json();
        setGame(json);
      }}>Start New Game</button>
    </div>
  )
}


export function Game({ game, setGame }) {

  const { currentRound } = game;

  return (
    <div>
      <div>id: {game.id}</div>
      <div>
        <div>current round ({currentRound.number}):</div>
        <div>
          <div>phase: {currentRound.phase}</div>
          <div>current trick:</div>
          <div>player estimates:</div>
          {currentRound.playerEstimates.map((estimate, i) => (
            <div>{game.players[i].name} {estimate}</div>
          ))}
          <div class="cards">
            {currentRound.currentTrick.map(card => {
              let [suit, value] = card;
              return (
                <div class="card">
                  <span class="suit">{suits[suit]}</span>
                  <span class="value">{value}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>your hand:</div>
        <div class="cards">
          {currentRound.authenticatedPlayerHand.map(card => {
            let [suit, value] = card;
            return (
              <div class="card">
                <span class="suit">{suits[suit]}</span>
                <span class="value">{value}</span>
              </div>
            )
          })}
        </div>

        {currentRound.phase === "ESTIMATION" && (
          <div>
            <div>How many tricks do you think you can win?</div>

            <div>what</div>
            {[...Array(currentRound.number).keys()].map(n => (
              <button onClick={async () => {
                const request = await window.fetch(API_URL + "estimate", {
                  method: "POST",
                  body: JSON.stringify({ gameId: game.id, estimate: n + 1 }),
                });
                const json = await request.json();
                setGame(json);
              }}>{n + 1}</button>
            ))}

          </div>
        )}
      </div>
    </div >
  )
}
