export function getPlayerAcummulatedScore(scoresheet, player) {
  const scores = scoresheet.map((round) => {

    const estimate = round[player].estimate;
    const actual = round[player].actual;
    const diff = estimate - actual;

    if (diff === 0) {
      return 20 + estimate * 10;
    } else {
      return Math.abs(diff) * -10;
    }
  });

  return scores.map((score, i) => {
    const slice = scores.slice(0,i+1);
    return slice.reduce((acc, curr) => {
      const sum = acc + curr;
      return sum;
    }, 0);
  });
}
