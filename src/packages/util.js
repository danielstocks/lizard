/**
 * Copies and shuffles an array
 * based on the Fisher–Yates sorting algorithm
 */
export function shuffleArray(array) {
  let newArray = array.slice(0);
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Use to pluralize english words
 * Return 's' if count is not 1
 */
export function pluralize(count) {
  return count !== 1 ? "s" : "";
}
