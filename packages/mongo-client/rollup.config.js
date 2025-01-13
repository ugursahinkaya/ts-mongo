import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: false
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json"
      }),
      terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true
        }
      })
    ]
  },
  {
    input: resolve(__dirname, "dist/index.d.ts"),
    output: {
      file: "dist/index.d.ts",
      format: "es"
    },
    plugins: [dts()]
  }
];
