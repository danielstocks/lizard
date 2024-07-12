import readline from "readline";

function userInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function init() {
  console.log("\nWelcome to Lizard!\n");

  let input;

  while (!["y", "n"].some((value) => value === input)) {
    input = await userInput("Start a new game?\n - Yes (y)\n - No (n)\n=> ");
  }

  console.log(input);

  if (input === "n") {
    process.exit(1);
  }
  if (input === "y") {
    console.log("\nStarting new game...");

    process.exit(1);
  }
}

init();
