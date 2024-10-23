import { server, router } from "./server.js";
import { createGame, estimate, play } from "./service.js";
import { addClient, removeClient } from "./sse.js";

router.get("/", (_, res) => {
  res.json({ status: "ok" });
});

router.get("/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  addClient(res);
  res.write(
    `data: ${JSON.stringify({
      type: "info",
      message: "Connected to the lizard stream",
    })} \n\n`,
  );

  // Close SSE connection when the client disconnects
  req.on("close", () => {
    removeClient(res);
  });
});

router.post("/create-game", (_, res) => {
  let result = createGame();
  res.json(result);
});

router.post("/estimate", (req, res) => {
  let { body } = req;
  estimate(body.gameId, body.estimate, (result) => {
    res.json(result);
  });
});

router.post("/play", (req, res) => {
  let { body } = req;
  play(body.gameId, body.card, (result) => {
    res.json(result);
  });
});

const PORT = 6060;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
