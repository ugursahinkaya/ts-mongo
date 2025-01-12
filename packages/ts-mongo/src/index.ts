import { generate } from "./generator";
import { analyzeTypeScriptCode } from "./read-file";
import { useMongoClient } from "./client-api.js";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import path from "path";
export { useMongoClient };

const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${__filename}`) {
  const args = process.argv.slice(2);
  const dbPath = args[0];
  const generatedDir = args[1];
  if (dbPath && generatedDir) {
    fs.mkdir(path.join(generatedDir, "models"), { recursive: true }).then(
      async () => {
        const tsCode = await fs.readFile(dbPath, "utf-8");
        generate(analyzeTypeScriptCode(tsCode), generatedDir);
      }
    );
  }
}
