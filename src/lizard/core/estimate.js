export function getRemainingTricksToBeWon(
  currentRound,
  scoresheet,
  player,
  numPlayers
) {
  // Prison rules only applies to last player to estimate
  const lastPlayer =
    scoresheet[currentRound].filter((item) => item !== null).length ==
    numPlayers - 1;
  if (!lastPlayer) return Infinity;

  // estimation & prison rules
  const tricksToBeWon = currentRound + 1;
  const tricksTaken = scoresheet[currentRound]
    .filter((item) => item !== null)
    .reduce((accumlatedEstimate, player) => {
      return accumlatedEstimate + player.estimate;
    }, 0);

  return tricksToBeWon - tricksTaken;
}
