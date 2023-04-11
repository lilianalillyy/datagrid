import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-import-css";

/**
 * @param {string} input
 * @param {string} output
 * @param {Record<string, any>} pkg
 * @param {'esm' | 'umd'} format
 * @param {boolean} typesOnly
 * @param {string} name
 */
export const definition = (
  input,
  output,
  pkg,
  format = "esm",
  minified = false,
  typesOnly = false,
  name = "Liliana"
) => {
  if (typesOnly) format = "esm";
  return {
    // ESM build for modern tools like webpack
    input,
    output: {
      sourcemap: true,
      file: output,
      format,
      ...(format == "umd" ? { name } : {}),
    },
    external: [
      ...(format === "esm" ? [/@babel\/runtime/, ...Object.keys(pkg.dependencies || {})] : []),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve(),
      css({ minify: minified }),
      ...(format === "umd" ? [commonjs()] : []),
      typescript(
        typesOnly
          ? {
              declaration: true,
              emitDeclarationOnly: true,
            }
          : {}
      ),
      babel({
        exclude: /node_modules/,
        include: "src/**",
        babelHelpers: "runtime",
      }),
      ...(minified ? [terser] : []),
    ],
  };
};
