import { execSync } from "child_process";
import * as path from "path";

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔄 Running database migrations...");

  try {
    // Use drizzle-kit push to sync schema with database
    execSync("npx drizzle-kit push", {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    console.log("✅ Database schema synchronized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();

