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
      // Get the admin user credentials (same as in seed script)
      const adminEmail = "admin@example.com";
      const adminPassword = "admin123456";

      // Use better-auth's built-in sign-in endpoint by making an internal request
      const signInUrl = `${req.protocol}://${req.get("host")}/api/auth/sign-in/email`;

      const signInResponse = await fetch(signInUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": req.get("User-Agent") || "better-auth-dev",
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });

      if (!signInResponse.ok) {
        const errorData = await signInResponse.text();
        throw new Error(
          `Sign-in failed: ${signInResponse.status} ${errorData}`
        );
      }

      const signInResult = await signInResponse.json();

      // Copy all Set-Cookie headers from the sign-in response to our response
      const setCookieHeaders = signInResponse.headers.getSetCookie?.() || [];
      setCookieHeaders.forEach((cookie) => {
        res.append("Set-Cookie", cookie);
      });

      res.json({
        success: true,
        message: "Signed in as LOCAL_ADMIN",
        user: signInResult.user || signInResult,
      });
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
