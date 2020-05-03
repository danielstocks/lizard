import { getPlayerAcummulatedScore } from './score';

const scoresheet = [
  [
    {
      estimate: 0,
      actual: 0,
    },
    {
      estimate: 1,
      actual: 0,
    },
    {
      estimate: 0,
      actual: 1,
    },
  ],
  [
    {
      estimate: 1,
      actual: 1,
    },
    {
      estimate: 1,
      actual: 0,
    },
    {
      estimate: 0,
      actual: 1,
    },
  ],
  [
    {
      estimate: 1,
      actual: 2,
    },
    {
      estimate: 1,
      actual: 1,
    },
    {
      estimate: 2,
      actual: 2,
    },
  ],
];

test("Accumlate score for player 1", () => {
    expect(getPlayerAcummulatedScore(scoresheet, 0)).toMatchObject([
        20, 50, 40
    ])
});

test("Accumlate score for player 2", () => {
    expect(getPlayerAcummulatedScore(scoresheet, 1)).toMatchObject([
        -10, -20, 10
    ])
});

test("Accumlate score for player 3", () => {
  expect(getPlayerAcummulatedScore(scoresheet, 2)).toMatchObject([
      -10, -20, 20
  ])
});

