import { useFela, createComponent } from "react-fela";
import React from "react";
import { Card, CARD_WIDTH } from "./card";
import { getPlayableCards } from "../core/play";

const translateKeyframe = ({ x, y }) => ({
  "0%": { transform: `translate(0px, 0px)` },
  "100%": { transform: `translate(${x}px, ${y}px)` },
});

const SIZE = 640;
const DELAY = 100;
const DURATION = "0.3s";

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

const opponent = ({ size, pos, players, active }) => {
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

const Opponent = createComponent(opponent, "div");

function isCardPlayable(card, playableCards) {
  return playableCards.indexOf(card) !== -1;
}

export const Opponents = ({
  currentPlayer,
  player,
  plays,
  numPlayers,
  hand,
  estimate,
  playCard,
  scoresheet,
  currentRound,
  phase,
  currentTrick,
}) => {
  const { renderer } = useFela();

  // Remove PlayerID from list of opponents
  // and render opponents in "correct" order
  const players = Array.from(Array(numPlayers).keys());
  const index = players.indexOf(player);
  const end = players.slice(index).slice(1);
  const begin = players.slice(0, index);
  const opponents = end.concat(begin);

  // Shortcuts
  const isPlayerTurn = currentPlayer == player;
  const playerHand = hand[player];

  // estimation & prison rules
  const tricksToBeWon = currentRound + 1;
  const tricksTaken = scoresheet[currentRound]
    .filter((item) => item !== null)
    .reduce((accumlatedEstimate, player) => {
      return accumlatedEstimate + player.estimate;
    }, 0);
  const lastPlayerToEstimate =
    scoresheet[currentRound].filter((item) => item !== null).length ==
    numPlayers - 1;
  const remainingTricksToBeWon = tricksToBeWon - tricksTaken;

  // play phase
  let playableCards = [];

  if (phase === "play" && isPlayerTurn) {
    const cardsInPlay = plays[currentRound][currentTrick].map(
      (play) => play.card
    );
    playableCards = getPlayableCards(cardsInPlay, playerHand);
  }

  return (
    <Container size={SIZE}>
      {playerHand.map((card, i) => {
        const delay =
          DELAY * numPlayers * (i + 1) +
          DELAY * (player + 1) -
          (DELAY * numPlayers + DELAY);

        const animationDelay = delay + "ms";

        // center cards
        const adjust = (CARD_WIDTH / 4) * playerHand.length - CARD_WIDTH / 4;
        const x = (CARD_WIDTH / 2) * (i + 1) - CARD_WIDTH / 2 - adjust;

        const cardIsPlayable =
          phase === "play" &&
          isPlayerTurn &&
          isCardPlayable(card, playableCards);

        return (
          <Div
            key={card.value + card.suit}
            extend={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {phase == "estimate" && (
              <Div
                extend={{
                  animationName: renderer.renderKeyframe(translateKeyframe, {
                    x,
                    y: SIZE / 2,
                  }),
                  animationDuration: DURATION,
                  animationFillMode: "forwards",
                  animationDelay,
                }}
              >
                <Card value={card.value} suit={card.suit} />
              </Div>
            )}
            {phase == "play" && (
              <Div
                extend={{
                  animationName: renderer.renderKeyframe(translateKeyframe, {
                    x,
                    y: SIZE / 2,
                  }),
                  animationDuration: "0",
                  animationFillMode: "forwards",
                }}
              >
                <Card
                  onClick={() => {
                    if (cardIsPlayable) {
                      playCard(i);
                    }
                  }}
                  playable={cardIsPlayable}
                  disabled={!cardIsPlayable}
                  value={card.value}
                  suit={card.suit}
                />
              </Div>
            )}
          </Div>
        );
      })}

      {phase == "estimate" && isPlayerTurn && (
        <Div
          extend={{
            width: "100%",
            textAlign: "center",
            position: "absolute",
            bottom: SIZE / 6 + "px",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
        >
          {Array.from(Array(currentRound + 2).keys()).map((round) => (
            <button
              key={"estimate" + round}
              disabled={
                lastPlayerToEstimate && remainingTricksToBeWon === round
              }
              onClick={() => {
                estimate(round);
              }}
            >
              {round}
            </button>
          ))}
        </Div>
      )}

      {opponents.map((opponent, i) => {
        const active = currentPlayer == opponent;
        const spread = 180 / (numPlayers - 2);
        const degrees = 180 + i * spread;
        const angle = (degrees * Math.PI) / 180;
        let x = Math.cos(angle) * (SIZE / 2);
        let y = Math.sin(angle) * (SIZE / 2);

        return (
          <React.Fragment key={"opponent" + opponent}>
            {hand[opponent].map((card, n) => {
              const delay =
                DELAY * numPlayers * (n + 1) +
                DELAY * (opponent + 1) -
                (DELAY * numPlayers + DELAY);

              const animationDelay = delay + "ms";

              return (
                <Div
                  key={"card" + opponent + n}
                  extend={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    zIndex: 100,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {phase === "estimate" && (
                    <Div
                      extend={{
                        animationName: renderer.renderKeyframe(
                          translateKeyframe,
                          {
                            x: x + n * 2,
                            y: y + n * 2,
                          }
                        ),
                        animationDuration: DURATION,
                        animationFillMode: "forwards",
                        animationDelay,
                      }}
                    >
                      <Card faceDown />
                    </Div>
                  )}
                  {phase === "play" && (
                    <Div
                      extend={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      <Card faceDown />
                    </Div>
                  )}
                </Div>
              );
            })}

            <Opponent
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
                Player {opponent}
              </Div>
            </Opponent>
          </React.Fragment>
        );
      })}
    </Container>
  );
};
