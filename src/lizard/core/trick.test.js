import { getWinningPlay } from "./trick";
import { createDeck, addSpecialCards } from "./deck";

const cards = [...createDeck(), ...addSpecialCards()].reduce((acc, card) => {
  acc[card.value + "-" + card.suit] = card;
  return acc;
}, {});

test("First lizard in play always wins", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["J-clubs"], player: 4 },
        { card: cards["2-lizard"], player: 3 },
        { card: cards["1-lizard"], player: 2 },
        { card: cards["A-hearts"], player: 1 },
      ],
      "clubs"
    )
  ).toMatchObject({ card: cards["2-lizard"], player: 3 });
});

test("Highest card in suit wins", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["2-clubs"], player: 1 },
        { card: cards["9-clubs"], player: 2 },
        { card: cards["8-clubs"], player: 3 },
        { card: cards["10-clubs"], player: 4 },
      ],
      "diamonds"
    )
  ).toMatchObject({ card: cards["10-clubs"], player: 4 });
});

test("Ace wins, over king", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["A-clubs"], player: 4 },
        { card: cards["2-clubs"], player: 3 },
        { card: cards["K-clubs"], player: 2 },
        { card: cards["9-hearts"], player: 1 },
      ],
      "diamonds"
    )
  ).toMatchObject({ card: cards["A-clubs"], player: 4 });
});

test("King wins, over queen", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["K-clubs"], player: 1 },
        { card: cards["2-clubs"], player: 2 },
        { card: cards["Q-clubs"], player: 3 },
        { card: cards["9-hearts"], player: 4 },
      ],
      "diamonds"
    )
  ).toMatchObject({ card: cards["K-clubs"], player: 1 });
});

test("Queen wins, over jack", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["Q-clubs"], player: 4 },
        { card: cards["2-clubs"], player: 3 },
        { card: cards["J-clubs"], player: 2 },
        { card: cards["9-hearts"], player: 1 },
      ],
      "diamonds"
    )
  ).toMatchObject({ card: cards["Q-clubs"], player: 4 });
});

test("Card with trump suit wins", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["J-clubs"], player: 1 },
        { card: cards["2-clubs"], player: 2 },
        { card: cards["9-hearts"], player: 3 },
        { card: cards["K-clubs"], player: 4 },
      ],
      "hearts"
    )
  ).toMatchObject({ card: cards["9-hearts"], player: 3 });
});

test("Highest card with trump suit wins", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["5-hearts"], player: 4 },
        { card: cards["2-clubs"], player: 3 },
        { card: cards["J-hearts"], player: 2 },
        { card: cards["K-clubs"], player: 1 },
      ],
      "hearts"
    )
  ).toMatchObject({ card: cards["J-hearts"], player: 2 });
});

test("Snake never wins", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["3-snake"], player: 1 },
        { card: cards["2-clubs"], player: 2 },
        { card: cards["3-clubs"], player: 3 },
        { card: cards["4-clubs"], player: 4 },
      ],
      "hearts"
    )
  ).toMatchObject({ card: cards["4-clubs"], player: 4 });
});

test("Snake never wins, unless snakes EVERYWHERE", () => {
  expect(
    getWinningPlay(
      [
        { card: cards["3-snake"], player: 4 },
        { card: cards["2-snake"], player: 3 },
        { card: cards["1-snake"], player: 2 },
        { card: cards["0-snake"], player: 1 },
      ],
      "clubs"
    )
  ).toMatchObject({ card: cards["3-snake"], player: 4 });
});
