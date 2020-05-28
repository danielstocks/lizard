import {
  createDeck,
  addSpecialCards,
  shuffle,
  cardToString,
} from "./core/deck";
import { getWinningPlay } from "./core/trick";

function log(message, G) {
  G.log.push({
    message: message.join(" "),
    date: new Date(),
  });
}

function pluralize(string, i) {
  if (i > 1 || i === 0) {
    return string + "s";
  }
  return string;
}

export const Game = {
  name: "lizard",

  minPlayers: 3,
  maxPlayers: 6,

  setup: (ctx) => {
    return {
      hand: Array(ctx.numPlayers).fill([]),
      currentRound: 0,
      numberOfRounds: Math.floor(60 / ctx.numPlayers),
      scoresheet: [],
      trumpCard: [],
      plays: [],
      log: [
        {
          message: "# Game started",
          date: new Date(),
        },
      ],
    };
  },

  phases: {
    estimate: {
      onBegin: (G, ctx) => {
        const round = G.currentRound;
        const players = Array.from(Array(ctx.numPlayers).keys());
        const rounds = Array.from(Array(G.currentRound + 1).keys());
        const deck = shuffle([...createDeck(), ...addSpecialCards()]);

        log(["# ---------------------"], G);
        log(["# Starting Round:", round + 1], G);
        log(["# Creating & Shuffling and Dealing cards..."], G);

        rounds.forEach(() => {
          players.forEach((player) => {
            G.hand[player].push(deck.shift());
          });
        });
        G.trumpCard[G.currentRound] = deck.shift();

        log(["# Trump suit is", G.trumpCard[G.currentRound].suit], G);

        log(["# Started Estimation Phase..."], G);
        G.scoresheet[G.currentRound] = [];
        G.currentTrick = 0;
        G.plays.push(Array(G.currentRound + 1).fill([]));
      },
      endIf: (G, ctx) => {
        // For some reason onBegin is called before endIf, so check if
        // current round has been initialized yet.
        if (!G.scoresheet[G.currentRound]) {
          return false;
        }

        // If everyone has made their estimate we can move to next phase
        if (
          G.scoresheet[G.currentRound].filter((item) => item !== null)
            .length === ctx.numPlayers
        ) {
          return true;
        }
        // Else keep estimating
        return false;
      },
      moves: {
        estimate: function (G, ctx, estimate) {
          log(["# Player", ctx.currentPlayer, "guessed", estimate], G);
          G.scoresheet[G.currentRound][ctx.currentPlayer] = { estimate };
        },
      },
      turn: {
        order: {
          first: (G, ctx) => {
            return G.currentRound % ctx.numPlayers;
          },
          next: (G, ctx) => {
            return (ctx.playOrderPos + 1) % ctx.playOrder.length;
          },
        },
        moveLimit: 1,
      },
      start: true,
      next: "play",
    },

    play: {
      onBegin: (G) => {
        log(
          [
            "# Begin Play - Trick",
            G.currentTrick + 1,
            "of",
            G.currentRound + 1,
            "tricks",
          ],
          G
        );
      },

      turn: {
        order: {
          first: (G, ctx) => {
            return G.currentRound % ctx.numPlayers;
          },
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
        },
      },

      onEnd: (G, ctx) => {
        const players = Array.from(Array(ctx.numPlayers).keys());
        const winners = G.plays[G.currentRound].map((trick) => {
          return trick.indexOf(
            getWinningPlay(trick, G.trumpCard[G.currentRound].suit)
          );
        });

        players.forEach((player) => {
          let numTricksWon = winners.filter((x) => x === player).length;
          log(
            [
              "# Player",
              player,
              "wins",
              numTricksWon,
              pluralize("trick", numTricksWon),
            ],
            G
          );
          G.scoresheet[G.currentRound][player].actual = numTricksWon;
        });

        G.currentRound += 1;
      },

      moves: {
        playCard: function (G, ctx, cardIndex) {
          const card = G.hand[ctx.currentPlayer].splice(cardIndex, 1)[0];
          log(["# Player", ctx.currentPlayer, "played", cardToString(card)], G);
          G.plays[G.currentRound][G.currentTrick].push({
            card,
            player: ctx.currentPlayer,
          });

          // Start next trick?
          if (
            G.plays[G.currentRound][G.currentTrick].length === ctx.numPlayers
          ) {
            // Who won previous trick?
            const winningPlay = getWinningPlay(
              G.plays[G.currentRound][G.currentTrick],
              G.trumpCard[G.currentRound].suit
            );
            log(
              [
                "# Winning Card:",
                cardToString(winningPlay.card),
                "played by player",
                winningPlay.player,
              ],
              G
            );

            // Start next trick
            G.currentTrick += 1;

            // Start next round?
            if (G.currentTrick > G.currentRound) {
              log(["# All tricks played out, starting new round"], G);
              ctx.events.setPhase("estimate");
            } else {
              log(
                [
                  "# Trick",
                  G.currentTrick + 1,
                  "of",
                  G.currentRound + 1,
                  "tricks",
                ],
                G
              );

              ctx.events.endTurn({ next: winningPlay.player });
            }
          } else {
            ctx.events.endTurn();
          }
        },
      },
    },
  },
};
