import { createServer } from "http";

const allowedOrigins = ["http://localhost:5173"];

export const router = {
  GET: {},
  POST: {},

  // Method to handle incoming requests based on the method and path
  handle: function (req, res) {
    const methodRoutes = this[req.method];
    const routeHandler = methodRoutes[req.url];

    // Allow CORS
    if (allowedOrigins.includes(req.headers.origin)) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // Handle the preflight request
    if (req.method === "OPTIONS") {
      res.writeHead(204); // 204: No Content
      res.end();
      return;
    }

    // This API is JSON only for now
    res.json = function (obj) {
      return res.end(JSON.stringify(obj));
    };
    res.setHeader("Content-Type", "application/json");

    if (routeHandler) {
      // POST requests, handle incoming JSON payload
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const parsedData = JSON.parse(body || null);
            req.body = parsedData;
            routeHandler(req, res);
          } catch (err) {
            console.error(err);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON" }));
          }
        });
      }
      // All other requests (GET, OPTIONS)
      else {
        routeHandler(req, res);
      }
    } else {
      // Return 404 if no route URL match
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
