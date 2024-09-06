/* This fixture simulates a round consisting of 4 tricks */
export const roundTestFixture = {
  moves: [
    {
      hands: [
        ["H2", "H5", "H8", "H11"],
        ["H3", "H6", "H9", "H12"],
        ["H4", "H7", "H10", "H13"],
      ],
      tricks: [],
    },
    {
      hands: [
        ["H2", "H5", "H8"],
        ["H3", "H6", "H9", "H12"],
        ["H4", "H7", "H10", "H13"],
      ],
      tricks: [["H11"]],
    },
    {
      hands: [
        ["H2", "H5", "H8"],
        ["H3", "H9", "H12"],
        ["H4", "H7", "H10", "H13"],
      ],
      tricks: [["H11", "H6"]],
    },
    {
      hands: [
        ["H2", "H5", "H8"],
        ["H3", "H9", "H12"],
        ["H4", "H7", "H13"],
      ],
      tricks: [["H11", "H6", "H10"]],
      // Winner: 0 (prev 0)
    },
    {
      hands: [
        ["H5", "H8"],
        ["H3", "H9", "H12"],
        ["H4", "H7", "H13"],
      ],
      tricks: [["H11", "H6", "H10"], ["H2"]],
    },
    {
      hands: [
        ["H5", "H8"],
        ["H3", "H9"],
        ["H4", "H7", "H13"],
      ],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12"],
      ],
    },
    {
      hands: [
        ["H5", "H8"],
        ["H3", "H9"],
        ["H4", "H7"],
      ],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
      ],
      // Winner: 2 (prev 0)
    },
    {
      hands: [["H5", "H8"], ["H3", "H9"], ["H7"]],
      tricks: [["H11", "H6", "H10"], ["H2", "H12", "H13"], ["H4"]],
    },
    {
      hands: [["H5"], ["H3", "H9"], ["H7"]],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
        ["H4", "H8"],
      ],
    },
    {
      hands: [["H5"], ["H3"], ["H7"]],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
        ["H4", "H8", "H9"],
      ],
      // Winner: 2 (- prev(2)) => 0
    },
    {
      hands: [["H5"], [], ["H7"]],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
        ["H4", "H8", "H9"],
        ["H3"],
      ],
    },
    {
      hands: [["H5"], [], []],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
        ["H4", "H8", "H9"],
        ["H3", "H7"],
      ],
    },
    {
      hands: [[], [], []],
      tricks: [
        ["H11", "H6", "H10"],
        ["H2", "H12", "H13"],
        ["H4", "H8", "H9"],
        ["H3", "H7", "H5"],
        // Winner: 1 (- prev(0)) => 1
      ],
    },
  ],
  trump: "H14",
  dealerOffset: 0,
  playerEstimates: [2, 1, 2],
  numberOfPlayers: 3,
};
