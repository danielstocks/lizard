import React, { useEffect, useRef, useState } from "react";
import { useFela } from "react-fela";
import { Card, CARD_WIDTH } from "./card";
import { getPlayableCards, isCardPlayable } from "../core/play";
import { getRemainingTricksToBeWon } from "../core/estimate";
import { Div, Container, Opponent, AbsoluteCenter } from "./layout";
import {
  CSSTransition,
  TransitionGroup,
  SwitchTransition,
} from "react-transition-group";

const translateKeyframe = ({ x, y }) => ({
  "0%": { transform: `translate(0px, 0px)`, opacity: 0 },
  "100%": { transform: `translate(${x}px, ${y}px)`, opacity: 1 },
});

const SIZE = 520;
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

/* Timeout the deal animation to allow previous trick to animate out */
const DEAL_TIMEOUT = 2000;
function getAnimationDelay(cardIndex, numPlayers, player) {
  return (
    DEAL_TIMEOUT +
    DELAY * numPlayers * (cardIndex + 1) +
    DELAY * (player + 1) -
    (DELAY * numPlayers + DELAY) +
    "ms"
  );
}

function getCardPosition(numPlayers, i) {
  const spread = 180 / (numPlayers - 2);
  const degrees = 180 + i * spread;
  const angle = (degrees * Math.PI) / 180;
  let x = Math.cos(angle) * (SIZE / 2);
  let y = Math.sin(angle) * (SIZE / 2);
  return [x, y];
}

export const PlayArea = ({
  trumpCard,
  plays,
  currentRound,
  player,
  currentPlayer,
  currentTrick,
  phase,
  numPlayers,
  playCard,
  estimate,
  scoresheet,
  hand,
}) => {

  // Trump card should always be flipped if we're in a "play" state
  const [trumpCardFlipped, flipTrumpCard] = useState(phase === "play");

  console.log(trumpCardFlipped, phase);

  // TOOD: This is broken, trump card is already flipped
  // when entering new round.
  /// https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "estimate") {
        flipTrumpCard(true);
      }
    }, DEAL_TIMEOUT + 100 * currentRound * numPlayers + 300);
    return () => clearTimeout(timer);
  });

  const { renderer } = useFela();
  const trick = plays[currentRound][currentTrick];
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

  const prevPlayerHandRef = useRef();
  useEffect(() => {
    prevPlayerHandRef.current = playerHand;
  });
  const prevPlayerHand = prevPlayerHandRef.current;

  return (
    <div>
      <Container size={SIZE}>
        <SwitchTransition>
          <CSSTransition key={currentRound + currentTrick} timeout={2000}>
            {(state) => {
              let opacity = (function () {
                if (state == "entering") {
                  return 1;
                }
                if (state == "entered") {
                  return 1;
                }
                if (state == "exiting") {
                  return 0;
                }
                if (state == "exited") {
                  return 0;
                }
              })();

              return (
                <Div
                  extend={{
                    padding: "10px",
                    opacity: opacity,
                    transition: "1s ease-out 1s",
                  }}
                >
                  <TransitionGroup>
                    {trick.map((play, i) => {
                      const card = play.card;
                      const trickPlayer = play.player;

                      return (
                        <CSSTransition key={card.value + card.suit} timeout={0}>
                          {(state) => {
                            let [x, y, rotation] = (function () {
                              if (state == "entered") {
                                return [20 * i, 20 * i, 10 * i];
                              }

                              if (state == "entering") {
                                if (player == trickPlayer) {
                                  const cardPos = prevPlayerHand.findIndex(
                                    (prevCard) =>
                                      prevCard.suit == card.suit &&
                                      prevCard.value == card.value
                                  );

                                  const adjust =
                                    (CARD_WIDTH / 4) * prevPlayerHand.length -
                                    CARD_WIDTH / 4;
                                  return [
                                    (CARD_WIDTH / 2) * (cardPos + 1) -
                                      CARD_WIDTH / 2 -
                                      adjust,
                                    SIZE / 2,
                                    0,
                                  ];
                                } else {
                                  const pos = opponents.indexOf(
                                    parseInt(trickPlayer, 10)
                                  );
                                  return getCardPosition(
                                    numPlayers,
                                    pos
                                  ).concat(0);
                                }
                              }

                              return [20 * i, 20 * i, 10 * i];
                            })();

                            return (
                              <AbsoluteCenter
                                key={"trick" + player + i}
                                extend={{ zIndex: 101 }}
                              >
                                <Div
                                  extend={{
                                    transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                                    transition: "0.3s ease-out",
                                  }}
                                >
                                  <Card
                                    value={card.value}
                                    suit={card.suit}
                                    key={card.value + card.suit}
                                  />
                                </Div>
                              </AbsoluteCenter>
                            );
                          }}
                        </CSSTransition>
                      );
                    })}
                  </TransitionGroup>
                </Div>
              );
            }}
          </CSSTransition>
        </SwitchTransition>

        {playerHand.map((card, i) => {
          // center cards
          const adjust = (CARD_WIDTH / 4) * playerHand.length - CARD_WIDTH / 4;
          const x = (CARD_WIDTH / 2) * (i + 1) - CARD_WIDTH / 2 - adjust;
          const y = SIZE / 2;

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
                      y,
                    }),
                    opacity: 0,
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
                    transform: `translate(${x}px, ${y}px)`,
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
          const [x, y] = getCardPosition(numPlayers, i);

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
                          opacity: 0,
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

      <AbsoluteCenter
        extend={{
          zIndex: 0,
          display: "flex",
          flexDirection: " row",
          alignItems: "center",
          padding: "20px",
          background: "darkseagreen",
          borderRadius: "10px",
        }}
      >
        {phase === "estimate" && (
          <div>
            <Div
              extend={{ position: "relative", height: "150px", width: "105px" }}
            >
              <Div
                extend={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                {trumpCard && (
                  <Card
                    faceDown={!trumpCardFlipped}
                    value={trumpCard.value}
                    suit={trumpCard.suit}
                  />
                )}
              </Div>
            </Div>
          </div>
        )}
        {phase === "play" && (
          <div>
            <div
              style={{
                width: "105px",
                border: "2px dashed green",
                height: "150px",
                borderRadius: "8px",
              }}
            >
              <Div
                extend={{
                  position: "absolute",
                  top: "-70px",
                  left: "-70px",
                  textAlign: "center",
                }}
              >
                <Div
                  extend={{
                    paddingBottom: "6px",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  Trump:
                </Div>
                <Div
                  extend={{
                    transform: "scale(0.5)",
                    transformOrigin: "top center",
                  }}
                >
                  <Card
                    faceDown={!trumpCardFlipped}
                    value={trumpCard.value}
                    suit={trumpCard.suit}
                  />
                </Div>
              </Div>
            </div>
          </div>
        )}
      </AbsoluteCenter>
    </div>
  );
};
