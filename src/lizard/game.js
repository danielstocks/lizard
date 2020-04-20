import { createDeck, addSpecialCards, suitSymbols, shuffle } from "./deck";
import { TurnOrder } from "boardgame.io/core";

export const Game = {
  name: "lizard",

  setup: (ctx) => {
    return {
      hand: Array(ctx.numPlayers).fill([]),
      currentRound: 0,
      numberOfRounds: Math.floor(60 / ctx.numPlayers),
      scoresheet: [],
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
        G.trumpCard = G.deck.shift();
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
      next: "play",

      onBegin: (G, ctx) => {
        if (G.currentTrick > G.currentRound) {
          console.log("# All tricks played out, starting new round");
          G.currentRound += 1;
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
      },

      onEnd: (G) => {
        G.currentTrick += 1;
      },

      moves: {
        playCard: function (G, ctx, cardIndex) {
          const card = G.hand[ctx.currentPlayer].splice(cardIndex, 1)[0];
          console.log(
            "Player",
            ctx.currentPlayer,
            "played",
            suitSymbols[card.suit],
            card.value
          );
          G.plays[G.currentRound][G.currentTrick].push(card);
        },
      },
      turn: {
        order: TurnOrder.ONCE,
        moveLimit: 1,
      },
    },
  },
};
