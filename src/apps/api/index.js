import { server, router } from "./server.js";
import { createGame, estimate, play } from "./service.js";

// Define some routes
router.get("/", (_, res) => {
  res.json({ status: "ok" });
});

router.post("/create-game", (_, res) => {
  let result = createGame();
  res.json(result);
});

router.post("/estimate", (req, res) => {
  let { body } = req;
  let result = estimate(body.gameId, body.estimate);
  res.json(result);
});

router.post("/play", (req, res) => {
  let { body } = req;
  let result = play(body.gameId, body.card);
  res.json(result);
});

// Start the server
const PORT = 6666;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
