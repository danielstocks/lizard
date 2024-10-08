import { createServer } from "http";

// Create a simple router function
export const router = {
  GET: {},
  POST: {},

  // Method to handle incoming requests based on the method and path
  handle: function (req, res) {
    const methodRoutes = this[req.method];
    const routeHandler = methodRoutes[req.url];

    res.json = function (obj) {
      return res.end(JSON.stringify(obj));
    };

    // Default to JSON
    res.setHeader("Content-Type", "application/json");

    if (routeHandler) {
      if (req.method === "POST") {
        let body = "";

        // Collect the data as it comes in
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          try {
            const parsedData = JSON.parse(body || null);
            req.body = parsedData;
            routeHandler(req, res);
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON" }));
          }
        });
      } else {
        routeHandler(req, res);
      }
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("404 Not Found");
    }
  },

  // Helper methods to define routes for GET and POST
  get: function (path, handler) {
    this.GET[path] = handler;
  },
  post: function (path, handler) {
    this.POST[path] = handler;
  },
};

// Create the server
export const server = createServer((req, res) => {
  router.handle(req, res);
});
