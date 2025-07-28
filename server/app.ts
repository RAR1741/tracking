import { createRequestHandler } from "@react-router/express";
import { toNodeHandler } from "better-auth/node";
import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";
import postgres from "postgres";
import "react-router";

import { DatabaseContext } from "~/database/context";
import * as schema from "~/database/schema";
import { auth } from "../auth.js";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = postgres(process.env.DATABASE_URL, {
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
const db = drizzle(client, { schema });
app.use((_, __, next) => DatabaseContext.run(db, next));

// Auth endpoints - DON'T use express.json() before this
// Using Express v5 pattern
app.all("/api/auth/*splat", toNodeHandler(auth));

// Add JSON parsing middleware for other routes after auth
app.use(express.json());

// Handle Chrome DevTools well-known endpoint specifically
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({ error: "DevTools config not found" });
});

// Handle other .well-known requests
app.use(/^\/\.well-known\/.*/, (req, res) => {
  res.status(404).json({ error: "Well-known resource not found" });
});

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  })
);
