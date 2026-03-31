import { Router } from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assertBoard } from "./authz.js";

export function openclawRoutes() {
  const router = Router();

  router.get("/openclaw/agents", assertBoard, (_req, res) => {
    const configPath =
      process.env.OPENCLAW_CONFIG ??
      path.join(os.homedir(), ".openclaw/openclaw.json");
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(raw);
      const list: { id?: string }[] = config?.agents?.list ?? [];
      const agents = list
        .filter((a) => typeof a?.id === "string")
        .map((a) => a.id as string);
      res.json({ agents });
    } catch {
      res.json({ agents: [] });
    }
  });

  return router;
}
