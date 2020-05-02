import { getWinningCard } from "./trick";
import { createDeck, addSpecialCards } from "./deck";

const cards = {};
const deck = [...createDeck(), ...addSpecialCards()].map((card) => {
  cards[card.value + "-" + card.suit] = card;
});

test("First lizard in play always wins", () => {
  expect(
    getWinningCard(
      [
        cards["J-clubs"],
        cards["2-lizard"],
        cards["1-lizard"],
        cards["A-hearts"],
      ],
      "clubs"
    )
  ).toMatchObject(cards["2-lizard"]);
});

test("Highest card in suit wins", () => {
  expect(
    getWinningCard(
      [cards["2-clubs"], cards["9-clubs"], cards["8-clubs"], cards["10-clubs"]],
      "diamonds"
    )
  ).toMatchObject(cards["10-clubs"]);
});

test("Ace wins, over king", () => {
  expect(
    getWinningCard(
      [cards["A-clubs"], cards["2-clubs"], cards["K-clubs"], cards["9-hearts"]],
      "diamonds"
    )
  ).toMatchObject(cards["A-clubs"]);
});

test("King wins, over queen", () => {
  expect(
    getWinningCard(
      [cards["K-clubs"], cards["2-clubs"], cards["Q-clubs"], cards["9-hearts"]],
      "diamonds"
    )
  ).toMatchObject(cards["K-clubs"]);
});

test("Queen wins, over jack", () => {
  expect(
    getWinningCard(
      [cards["Q-clubs"], cards["2-clubs"], cards["J-clubs"], cards["9-hearts"]],
      "diamonds"
    )
  ).toMatchObject(cards["Q-clubs"]);
});

test("Card with trump suit wins", () => {
  expect(
    getWinningCard(
      [cards["J-clubs"], cards["2-clubs"], cards["9-hearts"], cards["K-clubs"]],
      "hearts"
    )
  ).toMatchObject(cards["9-hearts"]);
});

test("Highest card with trump suit wins", () => {
  expect(
    getWinningCard(
      [
        cards["5-hearts"],
        cards["2-clubs"],
        cards["J-hearts"],
        cards["K-clubs"],
      ],
      "hearts"
    )
  ).toMatchObject(cards["J-hearts"]);
});

test("Snake never wins", () => {
  expect(
    getWinningCard(
      [cards["3-snake"], cards["2-clubs"], cards["3-clubs"], cards["4-clubs"]],
      "hearts"
    )
  ).toMatchObject(cards["4-clubs"]);
});

test("Snake never wins, unless snakes EVERYWHERE", () => {
  expect(
    getWinningCard(
      [cards["3-snake"], cards["2-snake"], cards["1-snake"], cards["0-snake"]],
      "clubs"
    )
  ).toMatchObject(cards["3-snake"]);
});
