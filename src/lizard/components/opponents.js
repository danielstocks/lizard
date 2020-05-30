import { useFela } from "react-fela";
import React from "react";
import { Card, CARD_WIDTH } from "./card";
import { getPlayableCards, isCardPlayable } from "../core/play";
import { getRemainingTricksToBeWon } from "../core/estimate";
import { Div, Container, Opponent, AbsoluteCenter } from "./layout";

const translateKeyframe = ({ x, y }) => ({
  "0%": { transform: `translate(0px, 0px)` },
  "100%": { transform: `translate(${x}px, ${y}px)` },
});

const SIZE = 640;
const DELAY = 100;
const DURATION = "0.3s";

// Remove player from list of opponents
// and render opponents in "correct" order
function getOpponents(numPlayers, player) {
  const players = Array.from(Array(numPlayers).keys());
  const index = players.indexOf(player);
  const end = players.slice(index).slice(1);
  const begin = players.slice(0, index);
  return end.concat(begin);
}

function getAnimationDelay(cardIndex, numPlayers, player) {
  return (
    DELAY * numPlayers * (cardIndex + 1) +
    DELAY * (player + 1) -
    (DELAY * numPlayers + DELAY) +
    "ms"
  );
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
  const opponents = getOpponents(numPlayers, player);
  const isPlayerTurn = currentPlayer == player;
  const playerHand = hand[player];

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
        // center cards
        const adjust = (CARD_WIDTH / 4) * playerHand.length - CARD_WIDTH / 4;
        const x = (CARD_WIDTH / 2) * (i + 1) - CARD_WIDTH / 2 - adjust;

        const cardIsPlayable =
          phase === "play" &&
          isPlayerTurn &&
          isCardPlayable(card, playableCards);

        return (
          <AbsoluteCenter key={card.value + card.suit}>
            {phase == "estimate" && (
              <Div
                extend={{
                  animationName: renderer.renderKeyframe(translateKeyframe, {
                    x,
                    y: SIZE / 2,
                  }),
                  animationDuration: DURATION,
                  animationFillMode: "forwards",
                  animationDelay: getAnimationDelay(i, numPlayers, player),
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
          </AbsoluteCenter>
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
                getRemainingTricksToBeWon(
                  currentRound,
                  scoresheet,
                  player,
                  numPlayers
                ) === round
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
              return (
                <AbsoluteCenter
                  key={"card" + opponent + n}
                  extend={{
                    zIndex: 100,
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
                        animationDelay: getAnimationDelay(
                          n,
                          numPlayers,
                          opponent
                        ),
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
                </AbsoluteCenter>
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
