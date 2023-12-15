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
var import_tsup = require("tsup");
var import_plugin = __toESM(require("node-stdlib-browser/helpers/esbuild/plugin"));
var import_node_stdlib_browser = __toESM(require("node-stdlib-browser"));
var tsup_config_default = (0, import_tsup.defineConfig)((options) => ({
  // shims: true,
  entry: ["src/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs", "esm"],
  target: "ES2020",
  sourcemap: true,
  clean: true,
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
  }
}));
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL21hcmsvb3JkZXJseS9vcmRlcmx5LXdlYi9wYWNrYWdlcy9jb3JlL3RzdXAuY29uZmlnLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9tYXJrL29yZGVybHkvb3JkZXJseS13ZWIvcGFja2FnZXMvY29yZVwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvbWFyay9vcmRlcmx5L29yZGVybHktd2ViL3BhY2thZ2VzL2NvcmUvdHN1cC5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidHN1cFwiO1xuLy8gaW1wb3J0IHsgcG9seWZpbGxOb2RlIH0gZnJvbSBcImVzYnVpbGQtcGx1Z2luLXBvbHlmaWxsLW5vZGVcIjtcbmltcG9ydCBwbHVnaW4gZnJvbSBcIm5vZGUtc3RkbGliLWJyb3dzZXIvaGVscGVycy9lc2J1aWxkL3BsdWdpblwiO1xuaW1wb3J0IHN0ZExpYkJyb3dzZXIgZnJvbSBcIm5vZGUtc3RkbGliLWJyb3dzZXJcIjtcbi8vIGltcG9ydCBzaGltIGZyb20gXCJub2RlLXN0ZGxpYi1icm93c2VyL2hlbHBlcnMvZXNidWlsZC9zaGltXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9ucykgPT4gKHtcbiAgLy8gc2hpbXM6IHRydWUsXG4gIGVudHJ5OiBbXCJzcmMvaW5kZXgudHNcIl0sXG4gIHNwbGl0dGluZzogZmFsc2UsXG4gIG1pbmlmeTogIW9wdGlvbnMud2F0Y2gsXG4gIGZvcm1hdDogW1wiY2pzXCIsIFwiZXNtXCJdLFxuICB0YXJnZXQ6IFwiRVMyMDIwXCIsXG4gIHNvdXJjZW1hcDogdHJ1ZSxcbiAgY2xlYW46IHRydWUsXG4gIGR0czogdHJ1ZSxcbiAgbm9FeHRlcm5hbDogW1wiYnM1OFwiLCBcIkBub2JsZS9lZDI1NTE5XCJdLFxuICBlc2J1aWxkUGx1Z2luczogW1xuICAgIHBsdWdpbihzdGRMaWJCcm93c2VyKSxcbiAgICAvLyBwb2x5ZmlsbE5vZGUoe1xuICAgIC8vICAgcG9seWZpbGxzOiB7XG4gICAgLy8gICAgIGJ1ZmZlcjogdHJ1ZSxcbiAgICAvLyAgICAgLy8gY3J5cHRvOiB0cnVlLFxuICAgIC8vICAgfSxcbiAgICAvLyB9KSxcbiAgXSxcbiAgZXNidWlsZE9wdGlvbnMob3B0aW9ucywgY29udGV4dCkge1xuICAgIG9wdGlvbnMuZGVmaW5lLkJ1ZmZlciA9IFwiQnVmZmVyXCI7XG4gICAgb3B0aW9ucy5kZWZpbmUucHJvY2VzcyA9IFwicHJvY2Vzc1wiO1xuICAgIG9wdGlvbnMuZGVmaW5lLmdsb2JhbCA9IFwiZ2xvYmFsXCI7XG4gICAgb3B0aW9ucy5pbmplY3QgPSBbXG4gICAgICByZXF1aXJlLnJlc29sdmUoXCJub2RlLXN0ZGxpYi1icm93c2VyL2hlbHBlcnMvZXNidWlsZC9zaGltXCIpLFxuICAgIF07XG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXFSLGtCQUE2QjtBQUVsVCxvQkFBbUI7QUFDbkIsaUNBQTBCO0FBRzFCLElBQU8sMEJBQVEsMEJBQWEsQ0FBQyxhQUFhO0FBQUE7QUFBQSxFQUV4QyxPQUFPLENBQUMsY0FBYztBQUFBLEVBQ3RCLFdBQVc7QUFBQSxFQUNYLFFBQVEsQ0FBQyxRQUFRO0FBQUEsRUFDakIsUUFBUSxDQUFDLE9BQU8sS0FBSztBQUFBLEVBQ3JCLFFBQVE7QUFBQSxFQUNSLFdBQVc7QUFBQSxFQUNYLE9BQU87QUFBQSxFQUNQLEtBQUs7QUFBQSxFQUNMLFlBQVksQ0FBQyxRQUFRLGdCQUFnQjtBQUFBLEVBQ3JDLGdCQUFnQjtBQUFBLFFBQ2QsY0FBQUEsU0FBTywyQkFBQUMsT0FBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT3RCO0FBQUEsRUFDQSxlQUFlQyxVQUFTLFNBQVM7QUFDL0IsSUFBQUEsU0FBUSxPQUFPLFNBQVM7QUFDeEIsSUFBQUEsU0FBUSxPQUFPLFVBQVU7QUFDekIsSUFBQUEsU0FBUSxPQUFPLFNBQVM7QUFDeEIsSUFBQUEsU0FBUSxTQUFTO0FBQUEsTUFDZixnQkFBZ0IsMENBQTBDO0FBQUEsSUFDNUQ7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGx1Z2luIiwgInN0ZExpYkJyb3dzZXIiLCAib3B0aW9ucyJdCn0K
