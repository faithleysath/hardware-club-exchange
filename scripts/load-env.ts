import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

const localEnvFiles = [".env", ".env.local", ".env.development.local"];

export function loadLocalEnv() {
  for (const file of localEnvFiles) {
    if (existsSync(file)) {
      loadEnvFile(file);
    }
  }
}
