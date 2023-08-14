"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  WS: () => ws_default,
  __ORDERLY_API_URL_KEY__: () => __ORDERLY_API_URL_KEY__,
  get: () => get,
  post: () => post
});
module.exports = __toCommonJS(src_exports);

// src/fetch/index.ts
function request(url, options) {
  return __async(this, null, function* () {
    if (!url.startsWith("http")) {
      throw new Error("url must start with http(s)");
    }
    const urlInstance = new URL(url);
    const response = yield fetch(urlInstance, __spreadProps(__spreadValues({}, options), {
      // mode: "cors",
      // credentials: "include",
      headers: _createHeaders(options.headers)
    })).catch((err) => {
      throw new Error(err);
    });
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  });
}
function _createHeaders(headers = {}) {
  const _headers = new Headers(headers);
  if (!_headers.has("Content-Type")) {
    _headers.append("Content-Type", "application/json;charset=utf-8");
  }
  return _headers;
}
function get(url, options) {
  return __async(this, null, function* () {
    const res = yield request(url, __spreadValues({
      method: "GET"
    }, options));
    if (res.success) {
      return res.data;
    }
    throw new Error(res.message);
  });
}
function post(url, data, options) {
  return __async(this, null, function* () {
    return request(url, __spreadValues({
      method: "POST",
      body: JSON.stringify(data)
    }, options));
  });
}

// src/ws/index.ts
var import_webSocket = require("rxjs/webSocket");

// src/ws/contants.ts
var WS_URL = {
  testnet: {
    public: "wss://testnet-ws.orderly.org/ws/stream/",
    private: "wss://testnet-ws-private.orderly.org/v2/ws/private/stream/"
  },
  mainnet: {
    public: "wss://mainnet-ws.orderly.io",
    private: "wss://mainnet-ws.orderly.io"
  }
};

// src/ws/index.ts
var import_rxjs = require("rxjs");

// src/ws/handler/baseHandler.ts
var BaseHandler = class {
  // constructor(readonly wsSubject: WebSocketSubject<any>) {}
  handle(message, send) {
    throw new Error("Method not implemented.");
  }
};

// src/ws/handler/ping.ts
var PingHandler = class extends BaseHandler {
  handle(_, send) {
    send({ event: "pong", ts: Date.now() });
  }
};

// src/ws/handler/handler.ts
var messageHandlers = /* @__PURE__ */ new Map([
  ["ping", new PingHandler()]
]);

// src/ws/index.ts
var WS = class {
  constructor(options) {
    this.authenticated = false;
    this.wsSubject = this.createSubject(options);
    this.bindSubscribe();
  }
  createSubject(options) {
    let url;
    if (typeof options.url === "string") {
      url = options.url;
    } else {
      url = WS_URL[options.networkId || "testnet"].public;
    }
    return (0, import_webSocket.webSocket)({
      url,
      openObserver: {
        next: () => {
          console.log("Connection ok");
        }
      },
      closeObserver: {
        next: () => {
          console.log("Connection closed");
        }
      }
    });
  }
  bindSubscribe() {
    const send = this.send.bind(this);
    this.wsSubject.subscribe({
      next(message) {
        const handler = messageHandlers.get(message.event);
        if (handler) {
          handler.handle(message, send);
        }
      },
      error(err) {
        console.log("WS Error: ", err);
      },
      complete() {
        console.log("WS Connection closed");
      }
    });
  }
  authenticate() {
    if (this.authenticated)
      return;
    this.wsSubject.next({ type: "authenticate" });
    this.authenticated = true;
  }
  send(message) {
    this.wsSubject.next(message);
  }
  observe(params, unsubscribe, messageFilter) {
    const [subscribeMessage, unsubscribeMessage, filter, messageFormatter] = this.generateMessage(params, unsubscribe, messageFilter);
    return new import_rxjs.Observable((observer) => {
      try {
        this.send(subscribeMessage);
      } catch (err) {
        observer.error(err);
      }
      const subscription = this.wsSubject.subscribe({
        next: (x) => {
          try {
            if (filter(x)) {
              observer.next(messageFormatter(x));
            }
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete()
      });
      return () => {
        try {
          if (!!unsubscribeMessage) {
            this.send(unsubscribeMessage);
          }
        } catch (err) {
          observer.error(err);
        }
        subscription.unsubscribe();
      };
    });
  }
  privateObserve(topic) {
    return this.observe(topic);
  }
  generateMessage(params, unsubscribe, messageFilter) {
    let subscribeMessage, unsubscribeMessage;
    let filter, messageFormatter = (message) => message.data;
    if (typeof params === "string") {
      subscribeMessage = { event: "subscribe", topic: params };
      unsubscribeMessage = { event: "unsubscribe", topic: params };
      filter = (message) => message.topic === params;
    } else {
      subscribeMessage = params;
      unsubscribeMessage = typeof unsubscribe === "function" ? unsubscribe() : unsubscribe;
      filter = messageFilter || ((message) => true);
    }
    return [subscribeMessage, unsubscribeMessage, filter, messageFormatter];
  }
};
// the topic reference count;
WS.__topicRefCountMap = /* @__PURE__ */ new Map();
var ws_default = WS;

// src/constants.ts
var __ORDERLY_API_URL_KEY__ = "__ORDERLY_API_URL__";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WS,
  __ORDERLY_API_URL_KEY__,
  get,
  post
});
//# sourceMappingURL=index.js.map