"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  get: () => get,
  post: () => post
});
module.exports = __toCommonJS(src_exports);

// src/fetch/index.ts
function request(url, options) {
  if (!url.startsWith("http")) {
    throw new Error("url must start with http(s)");
  }
  return fetch(url, {
    ...options,
    headers: _createHeaders(options.headers)
  });
}
function _createHeaders(headers = {}) {
  const _headers = new Headers(headers);
  if (!_headers.has("Content-Type")) {
    _headers.append("Content-Type", "application/json");
  }
  return _headers;
}
function get(url) {
  return request(url, {
    method: "GET"
  });
}
function post(url, data) {
  return request(url, {
    method: "POST",
    body: JSON.stringify(data)
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  get,
  post
});
//# sourceMappingURL=index.js.map