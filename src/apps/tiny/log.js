export function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toLocaleTimeString(), "| game log:", ...args);
  }
}

export function playerLog(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(...args);
  }
}
