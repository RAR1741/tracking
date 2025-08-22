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

// Development-only auto-signin endpoint
if (process.env.NODE_ENV === "development") {
  app.post("/api/dev/signin-admin", async (req, res) => {
    try {
      // Generate a session token
      const crypto = await import("crypto");
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Insert session directly into database
      await db
        .insert(schema.session)
        .values({
          id: crypto.randomUUID(),
          userId: "local-admin-dev", // This should match the user ID from seed
          token: sessionToken,
          expiresAt,
          ipAddress: req.ip || "127.0.0.1",
          userAgent: req.headers["user-agent"] || "dev-client",
        })
        .onConflictDoNothing();

      // Set the session cookie
      res.cookie("better-auth.session_token", sessionToken, {
        httpOnly: true,
        secure: false, // dev mode
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      // Assign admin role after successful signin
      const seedModule = await import("../database/seed.js");
      await seedModule.seedLocalAdmin();

      res.json({ success: true, message: "Signed in as LOCAL_ADMIN" });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Dev signin error:", error);
      }
      res.status(500).json({
        error: "Failed to sign in as LOCAL_ADMIN",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

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
