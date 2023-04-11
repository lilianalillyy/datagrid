import { definition } from "../../rollup/index.mjs";
import pkg from "./package.json" assert { type: "json" };

export default [
  // UMD build (core)
  definition("src/index.ts", "dist/datagrid-naja.js", pkg, "umd"),
  definition("src/index.ts", "dist/datagrid-naja.min.js", pkg, "umd", true),

  // ESM build (core) + typedefs
  definition("src/index.esm.ts", "dist/datagrid-naja-esm.js", pkg, "esm"),
  definition("src/index.esm.ts", "dist/datagrid-naja-esm.min.js", pkg, "esm", true),
  definition("src/index.esm.ts", "dist/datagrid-naja.esm.js", pkg, "esm", false, true),
];
