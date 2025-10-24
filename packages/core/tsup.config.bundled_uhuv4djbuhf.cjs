"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// tsup.config.js
var tsup_config_exports = {};
__export(tsup_config_exports, {
  default: () => tsup_config_default
});
module.exports = __toCommonJS(tsup_config_exports);
var import_node_stdlib_browser = __toESM(require("node-stdlib-browser"));
var import_plugin = __toESM(require("node-stdlib-browser/helpers/esbuild/plugin"));
var import_tsup = require("tsup");
var tsup_config_default = (0, import_tsup.defineConfig)((options) => ({
  // shims: true,
  entry: ["src/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs", "esm"],
  target: "es2020",
  sourcemap: true,
  clean: !options.watch,
  dts: true,
  noExternal: ["bs58", "@noble/ed25519"],
  esbuildPlugins: [
    (0, import_plugin.default)(import_node_stdlib_browser.default)
    // polyfillNode({
    //   polyfills: {
    //     buffer: true,
    //     // crypto: true,
    //   },
    // }),
  ],
  esbuildOptions(options2, context) {
    options2.define.Buffer = "Buffer";
    options2.define.process = "process";
    options2.define.global = "global";
    options2.inject = [
      require.resolve("node-stdlib-browser/helpers/esbuild/shim")
    ];
    if (!options2.watch) {
      options2.drop = ["debugger"];
    }
  },
  tsconfig: "tsconfig.build.json"
}));
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2h4L29yZGVybHktd2ViL3BhY2thZ2VzL2NvcmUvdHN1cC5jb25maWcuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2h4L29yZGVybHktd2ViL3BhY2thZ2VzL2NvcmVcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2h4L29yZGVybHktd2ViL3BhY2thZ2VzL2NvcmUvdHN1cC5jb25maWcuanNcIjtpbXBvcnQgc3RkTGliQnJvd3NlciBmcm9tIFwibm9kZS1zdGRsaWItYnJvd3NlclwiO1xuLy8gaW1wb3J0IHsgcG9seWZpbGxOb2RlIH0gZnJvbSBcImVzYnVpbGQtcGx1Z2luLXBvbHlmaWxsLW5vZGVcIjtcbmltcG9ydCBwbHVnaW4gZnJvbSBcIm5vZGUtc3RkbGliLWJyb3dzZXIvaGVscGVycy9lc2J1aWxkL3BsdWdpblwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInRzdXBcIjtcblxuLy8gaW1wb3J0IHNoaW0gZnJvbSBcIm5vZGUtc3RkbGliLWJyb3dzZXIvaGVscGVycy9lc2J1aWxkL3NoaW1cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChvcHRpb25zKSA9PiAoe1xuICAvLyBzaGltczogdHJ1ZSxcbiAgZW50cnk6IFtcInNyYy9pbmRleC50c1wiXSxcbiAgc3BsaXR0aW5nOiBmYWxzZSxcbiAgbWluaWZ5OiAhb3B0aW9ucy53YXRjaCxcbiAgZm9ybWF0OiBbXCJjanNcIiwgXCJlc21cIl0sXG4gIHRhcmdldDogXCJlczIwMjBcIixcbiAgc291cmNlbWFwOiB0cnVlLFxuICBjbGVhbjogIW9wdGlvbnMud2F0Y2gsXG4gIGR0czogdHJ1ZSxcbiAgbm9FeHRlcm5hbDogW1wiYnM1OFwiLCBcIkBub2JsZS9lZDI1NTE5XCJdLFxuICBlc2J1aWxkUGx1Z2luczogW1xuICAgIHBsdWdpbihzdGRMaWJCcm93c2VyKSxcbiAgICAvLyBwb2x5ZmlsbE5vZGUoe1xuICAgIC8vICAgcG9seWZpbGxzOiB7XG4gICAgLy8gICAgIGJ1ZmZlcjogdHJ1ZSxcbiAgICAvLyAgICAgLy8gY3J5cHRvOiB0cnVlLFxuICAgIC8vICAgfSxcbiAgICAvLyB9KSxcbiAgXSxcbiAgZXNidWlsZE9wdGlvbnMob3B0aW9ucywgY29udGV4dCkge1xuICAgIG9wdGlvbnMuZGVmaW5lLkJ1ZmZlciA9IFwiQnVmZmVyXCI7XG4gICAgb3B0aW9ucy5kZWZpbmUucHJvY2VzcyA9IFwicHJvY2Vzc1wiO1xuICAgIG9wdGlvbnMuZGVmaW5lLmdsb2JhbCA9IFwiZ2xvYmFsXCI7XG4gICAgb3B0aW9ucy5pbmplY3QgPSBbXG4gICAgICByZXF1aXJlLnJlc29sdmUoXCJub2RlLXN0ZGxpYi1icm93c2VyL2hlbHBlcnMvZXNidWlsZC9zaGltXCIpLFxuICAgIF07XG4gICAgaWYgKCFvcHRpb25zLndhdGNoKSB7XG4gICAgICBvcHRpb25zLmRyb3AgPSBbXCJkZWJ1Z2dlclwiXTtcbiAgICB9XG4gIH0sXG4gIHRzY29uZmlnOiBcInRzY29uZmlnLmJ1aWxkLmpzb25cIixcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBdVAsaUNBQTBCO0FBRWpSLG9CQUFtQjtBQUNuQixrQkFBNkI7QUFJN0IsSUFBTywwQkFBUSwwQkFBYSxDQUFDLGFBQWE7QUFBQTtBQUFBLEVBRXhDLE9BQU8sQ0FBQyxjQUFjO0FBQUEsRUFDdEIsV0FBVztBQUFBLEVBQ1gsUUFBUSxDQUFDLFFBQVE7QUFBQSxFQUNqQixRQUFRLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDckIsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsT0FBTyxDQUFDLFFBQVE7QUFBQSxFQUNoQixLQUFLO0FBQUEsRUFDTCxZQUFZLENBQUMsUUFBUSxnQkFBZ0I7QUFBQSxFQUNyQyxnQkFBZ0I7QUFBQSxRQUNkLGNBQUFBLFNBQU8sMkJBQUFDLE9BQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU90QjtBQUFBLEVBQ0EsZUFBZUMsVUFBUyxTQUFTO0FBQy9CLElBQUFBLFNBQVEsT0FBTyxTQUFTO0FBQ3hCLElBQUFBLFNBQVEsT0FBTyxVQUFVO0FBQ3pCLElBQUFBLFNBQVEsT0FBTyxTQUFTO0FBQ3hCLElBQUFBLFNBQVEsU0FBUztBQUFBLE1BQ2YsZ0JBQWdCLDBDQUEwQztBQUFBLElBQzVEO0FBQ0EsUUFBSSxDQUFDQSxTQUFRLE9BQU87QUFDbEIsTUFBQUEsU0FBUSxPQUFPLENBQUMsVUFBVTtBQUFBLElBQzVCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsVUFBVTtBQUNaLEVBQUU7IiwKICAibmFtZXMiOiBbInBsdWdpbiIsICJzdGRMaWJCcm93c2VyIiwgIm9wdGlvbnMiXQp9Cg==
