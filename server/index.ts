import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/client.js";
import { dbContext } from "./db/context.js";
import { DATABASES } from "./db/databases.js";
import { itemsRouter } from "./routes/items.js";
import { tagsRouter } from "./routes/tags.js";
import { assistantRouter } from "./routes/assistant.js";

const PORT = Number(process.env.PORT ?? 8787);

const app = express();
app.use(cors({ exposedHeaders: ["X-Database"] }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: (process.env.LLM_PROVIDER ?? "mock").toLowerCase() });
});

// List the available databases for the header dropdown.
app.get("/api/databases", (_req, res) => {
  res.json(DATABASES.map(({ id, name, description }) => ({ id, name, description })));
});

// Resolve the active database (X-Database header) for all data routes.
app.use("/api/items", dbContext, itemsRouter);
app.use("/api/tags", dbContext, tagsRouter);
app.use("/api/assistant", dbContext, assistantRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal error" });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskNotes sidecar listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
