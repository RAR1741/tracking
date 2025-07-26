import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

console.log("Using DATABASE_URL:", process.env.DATABASE_URL);
console.log("Using NODE_ENV:", process.env.NODE_ENV);

const databaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";

// For production, ensure SSL is enabled if not already in the URL
const getConnectionUrl = () => {
  if (!isProduction) return databaseUrl;

  // Check if SSL is already configured in the URL
  if (databaseUrl.includes('sslmode=') || databaseUrl.includes('ssl=')) {
    return databaseUrl;
  }

  // Add SSL requirement for production
  const separator = databaseUrl.includes('?') ? '&' : '?';
  return `${databaseUrl}${separator}sslmode=require`;
};

export default defineConfig({
  out: "./drizzle",
  schema: "./database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getConnectionUrl(),
  },
});
