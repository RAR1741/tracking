import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DatabaseContext } from "../database/context";
import * as schema from "../database/schema";
import { seedLocalAdmin, seedRolesAndPermissions } from "../database/seed";

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

      // Also seed LOCAL_ADMIN in development
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Creating LOCAL_ADMIN user...");

        const adminResult = await seedLocalAdmin();

        if (adminResult.success) {
          console.log("✅", adminResult.message);
          if (adminResult.user) {
            console.log("👤 Admin user:", adminResult.user);
          }
        } else {
          console.error("❌ LOCAL_ADMIN creation failed:", adminResult.error);
        }
      } else {
        console.log(
          "ℹ️ Skipping LOCAL_ADMIN creation (not in development mode)"
        );
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
