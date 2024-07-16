import { playGame } from "./game.js";
import { RandomBotPlayer, CLIPlayer } from "./player.js";

let players = [
  //new CLIPlayer("Daniel"),
  new RandomBotPlayer("Daniel"),
  new RandomBotPlayer("Sara"),
  new RandomBotPlayer("Ruth"),
];

async function init() {
  console.log("\nWelcome to Lizard!");
  console.log("\nStarting new game...\n");
  await playGame(players, 18);
}

init();
