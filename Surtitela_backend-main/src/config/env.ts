import fs from "fs";
import dotenv from "dotenv";

export function loadEnvironment(): void {
  dotenv.config();
  const localEnvPath = ".env.local";
  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath, override: true });
  }
}
