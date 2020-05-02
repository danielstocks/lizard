import { getPlayableCards } from "./play";
import { createDeck, addSpecialCards } from "./deck";

const cards = {};
const deck = [...createDeck(), ...addSpecialCards()].map((card) => {
  cards[card.value + "-" + card.suit] = card;
});

test("Any card can be played if no card has been played yet", () => {
  expect(
    getPlayableCards([], [
      cards["J-clubs"],
      cards["4-diamonds"],
      cards["3-diamonds"],
      cards["A-hearts"],
    ])
  ).toMatchObject([
    cards["J-clubs"],
    cards["4-diamonds"],
    cards["3-diamonds"],
    cards["A-hearts"],
  ]);
});

test("player must follow suit", () => {
  expect(
    getPlayableCards([cards["5-diamonds"]], [
      cards["J-clubs"],
      cards["4-diamonds"],
      cards["3-diamonds"],
      cards["A-hearts"],
    ])
  ).toMatchObject([cards["4-diamonds"], cards["3-diamonds"]]);
});

test("player must follow suit played after lizar or snake", () => {
  expect(
    getPlayableCards([cards["1-lizard"], cards["J-clubs"]], [
      cards["J-clubs"],
      cards["4-diamonds"],
      cards["3-diamonds"],
      cards["A-hearts"],
    ])
  ).toMatchObject([cards["J-clubs"]]);
});

test("if snake or lizard is played, player must follow previous suit", () => {
  expect(
    getPlayableCards([cards["3-clubs"], cards["1-lizard"]], [
      cards["J-clubs"],
      cards["4-diamonds"],
      cards["3-diamonds"],
      cards["A-hearts"],
    ])
  ).toMatchObject([cards["J-clubs"]]);
});


test("player can always play a lizard or snake", () => {
  expect(
    getPlayableCards([cards["5-diamonds"]], [
      cards["3-diamonds"],
      cards["1-snake"],
      cards["1-lizard"],
      cards["A-hearts"],
    ])
  ).toMatchObject([cards["3-diamonds"], cards["1-snake"], cards["1-lizard"]]);
});

test("player can play any card if no suit on hand", () => {
  expect(
    getPlayableCards([cards["5-diamonds"]], [
      cards["3-clubs"],
      cards["4-hearts"],
      cards["5-spades"],
      cards["1-snake"],
    ])
  ).toMatchObject([
    cards["3-clubs"],
    cards["4-hearts"],
    cards["5-spades"],
    cards["1-snake"],
  ]);
});