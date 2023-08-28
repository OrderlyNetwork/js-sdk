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
  WebSocketClient: () => ws_default,
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
function get(url, options, formatter) {
  return __async(this, null, function* () {
    const res = yield request(url, __spreadValues({
      method: "GET"
    }, options));
    if (res.success) {
      if (typeof formatter === "function") {
        return formatter(res.data);
      }
      if (Array.isArray(res.data["rows"])) {
        return res.data["rows"];
      }
      return res.data;
    }
    throw new Error(res.message);
  });
}
function post(url, data, options) {
  return __async(this, null, function* () {
    const res = yield request(url, __spreadValues({
      method: "POST",
      body: JSON.stringify(data)
    }, options));
    return res;
  });
}

// src/ws/index.ts
var import_webSocket = require("rxjs/webSocket");

// src/ws/contants.ts
var WS_URL = {
  testnet: {
    // public: "wss://testnet-ws.orderly.org/ws/stream/",
    public: "wss://dev-ws-v2.orderly.org/ws/stream/",
    // private:
    //   "wss://dev-ws-private-v2.orderly.org/wsprivate/v2/ws/private/stream/",
    private: "wss://dev-ws-private-v2.orderly.org/v2/ws/private/stream/"
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
var _WebSocketClient = class _WebSocketClient {
  constructor(options) {
    this.authenticated = false;
    this._pendingPrivateSubscribe = [];
    this.send = (message) => {
      this.wsSubject.next(message);
    };
    this.privateSend = (message) => {
      if (!this.privateWsSubject) {
        console.warn("private ws not connected");
        return;
      }
      this.privateWsSubject.next(message);
    };
    this.wsSubject = this.createSubject(options);
    if (!!options.accountId) {
      this.privateWsSubject = this.createPrivateSubject(options);
    }
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
      url: `${url}${options.accountId || ""}`,
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
  createPrivateSubject(options) {
    const url = WS_URL[options.networkId || "testnet"].private;
    const ws = (0, import_webSocket.webSocket)({
      url: `${url}${options.accountId}`,
      openObserver: {
        next: () => {
          var _a;
          console.log("Private connection ok");
          if (this.authenticated || !options.accountId)
            return;
          (_a = options.onSigntureRequest) == null ? void 0 : _a.call(options, options.accountId).then((signature) => {
            this.authenticate(options.accountId, signature);
          });
        }
      },
      closeObserver: {
        next: () => {
          console.log("Private connection closed");
          this.authenticated = false;
        }
      }
    });
    return ws;
  }
  bindSubscribe() {
    this.wsSubject.subscribe({
      next: (message) => {
        const handler = messageHandlers.get(message.event);
        if (handler) {
          handler.handle(message, this.send);
        }
      },
      error(err) {
        console.log("WS Error: ", err);
      },
      complete() {
        console.log("WS Connection closed");
      }
    });
    if (!this.privateWsSubject)
      return;
    this.privateWsSubject.subscribe({
      next: (message) => {
        if (message.event === "auth") {
          this.authenticated = true;
          this._sendPendingPrivateMessage();
          return;
        }
        const handler = messageHandlers.get(message.event);
        if (handler) {
          handler.handle(message, this.privateSend);
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
  authenticate(accountId, message) {
    var _a;
    if (this.authenticated)
      return;
    if (!this.privateWsSubject) {
      console.error("private ws not connected");
      return;
    }
    console.log("push auth message:", message);
    (_a = this.privateWsSubject) == null ? void 0 : _a.next({
      id: "auth",
      event: "auth",
      params: {
        orderly_key: message.publicKey,
        sign: message.signature,
        timestamp: message.timestamp
      }
    });
  }
  get isAuthed() {
    return this.authenticated;
  }
  // observe<T>(topic: string): Observable<T>;
  // observe<T>(topic: string, unsubscribe?: () => any): Observable<T>;
  // observe<T>(
  //   params: {
  //     event: string;
  //   } & Record<string, any>,
  //   unsubscribe?: () => any
  // ): Observable<T>;
  observe(params, unsubscribe, messageFilter) {
    return this._observe(false, params, unsubscribe, messageFilter);
  }
  // privateObserve<T>(topic: string): Observable<T>;
  // privateObserve<T>(topic: string, unsubscribe?: () => any): Observable<T>;
  // privateObserve<T>(
  //   params: {
  //     event: string;
  //   } & Record<string, any>,
  //   unsubscribe?: () => any
  // ): Observable<T>;
  privateObserve(params, unsubscribe, messageFilter) {
    return this._observe(true, params, unsubscribe, messageFilter);
  }
  _observe(isPrivate, params, unsubscribe, messageFilter) {
    if (isPrivate && !this.privateWsSubject) {
      throw new Error("private ws not connected");
    }
    const subject = isPrivate ? this.privateWsSubject : this.wsSubject;
    const sendFunc = isPrivate ? this.privateSend : this.send;
    const [subscribeMessage, unsubscribeMessage, filter, messageFormatter] = this.generateMessage(params, unsubscribe, messageFilter);
    return new import_rxjs.Observable((observer) => {
      if (isPrivate && !this.authenticated) {
        this._pendingPrivateSubscribe.push(params);
        return;
      }
      try {
        const refCount = _WebSocketClient.__topicRefCountMap.get(subscribeMessage.topic) || 0;
        if (refCount === 0) {
          sendFunc(subscribeMessage);
          _WebSocketClient.__topicRefCountMap.set(
            subscribeMessage.topic,
            refCount + 1
          );
        }
      } catch (err) {
        observer.error(err);
      }
      const subscription = subject.subscribe({
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
          const refCount = _WebSocketClient.__topicRefCountMap.get(subscribeMessage.topic) || 0;
          if (refCount > 1) {
            _WebSocketClient.__topicRefCountMap.set(
              subscribeMessage.topic,
              refCount - 1
            );
            return;
          }
          if (!!unsubscribeMessage) {
            this.send(unsubscribeMessage);
          }
          _WebSocketClient.__topicRefCountMap.delete(subscribeMessage.topic);
        } catch (err) {
          observer.error(err);
        }
        subscription.unsubscribe();
      };
    });
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
  _sendPendingPrivateMessage() {
    if (this._pendingPrivateSubscribe.length === 0)
      return;
    this._pendingPrivateSubscribe.forEach((params) => {
      this.privateObserve(params).subscribe();
    });
    this._pendingPrivateSubscribe = [];
  }
  // 取消所有订阅
  desotry() {
    var _a;
    this.wsSubject.unsubscribe();
    (_a = this.privateWsSubject) == null ? void 0 : _a.unsubscribe();
  }
};
// the topic reference count;
_WebSocketClient.__topicRefCountMap = /* @__PURE__ */ new Map();
var WebSocketClient = _WebSocketClient;
var ws_default = WebSocketClient;

// src/constants.ts
var __ORDERLY_API_URL_KEY__ = "__ORDERLY_API_URL__";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WebSocketClient,
  __ORDERLY_API_URL_KEY__,
  get,
  post
});
//# sourceMappingURL=index.js.map