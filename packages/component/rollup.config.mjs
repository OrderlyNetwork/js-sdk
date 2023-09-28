import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import json from '@rollup/plugin-json'

import packageJson from "./package.json" assert { type: "json" };


export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
      },
      {
        file: packageJson.module,
        format: "esm",
      },
    ],
    // output: {
    //   file: packageJson.module,
    //   format: "esm",
    // },
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" }),
      // postcss({
      //   config: {
      //     path: "./postcss.config.js",
      //   },
      //   extensions: [".css"],
      //   minimize: true,
      //   inject: {
      //     insertAt: "top",
      //   },
      //   plugins: [],
      // }),
    ],
    external: [
        // ...Object.keys(packageJson.dependencies || {}),
        // ...Object.keys(packageJson.peerDependencies || {}),
        'react',
        'react-dom',
        'react-intl',
        ...Object.keys(packageJson.devDependencies || {}),
    ],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
