import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to perform server-to-server fetch and bypass browser CORS limits
  app.get("/api/team-dashboard", async (req, res) => {
    const targetUrl = (req.query.url as string) || "https://athina.pixelearth.co.uk/webhook/team-dashboard";

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 9000); // 9 seconds timeout

      const backendResponse = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Team-Activity-Dashboard/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!backendResponse.ok) {
        return res.status(backendResponse.status).json({
          error: `External endpoint returned status ${backendResponse.status}`,
          status: backendResponse.status
        });
      }

      const data = await backendResponse.json();
      return res.json(data);
    } catch (error: any) {
      console.error(`Proxy request to ${targetUrl} failed:`, error.message || error);
      return res.status(502).json({
        error: "Failed to connect to the external feed or fetch timed out.",
        details: error.message || String(error)
      });
    }
  });

  // Vite middleware for seamless asset delivery of React components
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Team Activity Server running on http://localhost:${PORT}`);
  });
}

startServer();
