import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DatabaseContext } from "../database/context";
import * as schema from "../database/schema";
import { seedRolesAndPermissions } from "../database/seed";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  try {
    await DatabaseContext.run(db, async () => {
      const result = await seedRolesAndPermissions();
      if (result.success) {
        console.log("✅", result.message);
      } else {
        console.error("❌", result.error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Failed to seed database:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
