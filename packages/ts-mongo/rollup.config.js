import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import replace from "@rollup/plugin-replace";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.node.js",
      format: "es",
      sourcemap: false,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "es",
        sourcemap: false,
      },
      {
        file: "dist/ts-mongo.umd.js",
        name: "YUM",
        sourcemap: false,
        extend: true,
        format: "umd",
      },
    ],
    plugins: [
      replace({
        preventAssignment: true,
        delimiters: ["", ""],
        [`const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === \`file://\${__filename}\`) {
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
}`]: "export { analyzeTypeScriptCode }",
        'import path from "path"': "",
        'import { promises as fs } from "fs";': "",
        'import { fileURLToPath } from "url";': "",
        'import { generate } from "./generator";': "",
      }),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
        },
      }),
    ],
  },
  {
    input: resolve(__dirname, "dist/index.d.ts"),
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
