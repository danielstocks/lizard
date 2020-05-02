import { createDeck, addSpecialCards, shuffle, cardToString } from "./deck";
import { TurnOrder } from "boardgame.io/core";
import { getWinningCard } from "./trick";

export const Game = {
  name: "lizard",

  setup: (ctx) => {
    return {
      hand: Array(ctx.numPlayers).fill([]),
      currentRound: 0,
      numberOfRounds: Math.floor(60 / ctx.numPlayers),
      scoresheet: [],
      trumpCard: [],
      plays: [],
    };
  },

  phases: {
    estimate: {
      onBegin: (G, ctx) => {
        const round = G.currentRound;

        console.log("# Starting Round:", round);

        console.log("Current Dealer: Player", ctx.currentPlayer);
        console.log("Creating & Shuffling Deck...");
        G.deck = shuffle([...createDeck(), ...addSpecialCards()]);

        console.log("Dealing Cards...");
        const players = Array.from(Array(ctx.numPlayers).keys());
        const rounds = Array.from(Array(G.currentRound + 1).keys());
        rounds.forEach(() => {
          players.forEach((player) => {
            G.hand[player].push(G.deck.shift());
          });
        });
        G.trumpCard[G.currentRound] = G.deck.shift();
        console.log("# Trump Suit", cardToString(G.trumpCard[G.currentRound]));

        G.deck = [];

        console.log("# Started Estimation Phase");
        console.log("Q: How many tricks will you win?");
        G.scoresheet[G.currentRound] = [];
        G.currentTrick = 0;
        G.plays.push(Array(G.currentRound + 1).fill([]));
      },
      moves: {
        estimate: function (G, ctx, estimate) {
          console.log("Player", ctx.currentPlayer, "guessed", estimate);
          G.scoresheet[G.currentRound][ctx.currentPlayer] = { estimate };
        },
      },
      turn: {
        order: TurnOrder.ONCE,
        moveLimit: 1,
      },
      start: true,
      next: "play",
    },

    play: {
      onBegin: (G, ctx) => {
        console.log(
          "# Phase Play - Trick",
          G.currentTrick + 1,
          "of",
          G.currentRound + 1,
          "tricks"
        );
      },

      onEnd: (G, ctx) => {
        const players = Array.from(Array(ctx.numPlayers).keys());
        const winners = G.plays[G.currentRound].map((trick) => {
          return trick.indexOf(getWinningCard(trick));
        });

        players.forEach((player) => {
          let numTricksWon = winners.filter((x) => x === player).length;
          console.log("Player", player, "wins", numTricksWon);
          G.scoresheet[G.currentRound][player].actual = numTricksWon;
        });

        G.currentRound += 1;
      },

      moves: {
        playCard: function (G, ctx, cardIndex) {
          const card = G.hand[ctx.currentPlayer].splice(cardIndex, 1)[0];
          console.log(
            "Player",
            ctx.currentPlayer,
            "played",
            cardToString(card)
          );
          G.plays[G.currentRound][G.currentTrick].push(card);

          // Start next trick?
          if (
            G.plays[G.currentRound][G.currentTrick].length === ctx.numPlayers
          ) {
            // Who won previous trick?
            const winningCard = getWinningCard(
              G.plays[G.currentRound][G.currentTrick],
              G.trumpCard[G.currentRound].suit
            );
            console.log("Winner:", cardToString(winningCard));

            // Start next trick
            G.currentTrick += 1;

            // Start next round?
            if (G.currentTrick > G.currentRound) {
              console.log("# All tricks played out, starting new round");
              ctx.events.setPhase("estimate");
            } else {
              console.log(
                "# Phase Play - Trick",
                G.currentTrick + 1,
                "of",
                G.currentRound + 1,
                "tricks"
              );
            }
          }
        },
      },
      turn: {
        moveLimit: 1,
      },
    },
  },
};
