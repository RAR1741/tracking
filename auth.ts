import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./database/schema.js";

// Create a separate database connection for auth
// This is necessary because auth needs to work outside of the AsyncLocalStorage context
const authClient = postgres(process.env.DATABASE_URL!, {
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const authDb = drizzle(authClient, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // TODO: Enable this in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins:
    process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:5173",
        ]
      : [],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "development",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
