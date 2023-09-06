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
  WS: () => WS,
  WebSocketClient: () => ws_default,
  __ORDERLY_API_URL_KEY__: () => __ORDERLY_API_URL_KEY__,
  del: () => del,
  get: () => get,
  mutate: () => mutate,
  post: () => post,
  put: () => put
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
      headers: _createHeaders(options.headers, options.method)
    }));
    if (response.ok) {
      const res = yield response.json();
      if (res.success) {
        return res;
      } else {
        throw new Error(res);
      }
    }
    const error = yield response.json();
    throw new Error(error.message || error.code || error);
  });
}
function _createHeaders(headers = {}, method) {
  const _headers = new Headers(headers);
  if (!_headers.has("Content-Type")) {
    if (method !== "DELETE") {
      _headers.append("Content-Type", "application/json;charset=utf-8");
    } else {
      _headers.append("Content-Type", "application/x-www-form-urlencoded");
    }
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
function put(url, data, options) {
  return __async(this, null, function* () {
    const res = yield request(url, __spreadValues({
      method: "PUT",
      body: JSON.stringify(data)
    }, options));
    return res;
  });
}
function del(url, options) {
  return __async(this, null, function* () {
    const res = yield request(url, __spreadValues({
      method: "DELETE"
    }, options));
    return res;
  });
}
function mutate(url, init) {
  return __async(this, null, function* () {
    const res = yield request(url, init);
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
    console.log(
      "observe---------------------------",
      params,
      unsubscribe,
      messageFilter
    );
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

// src/ws/ws.ts
var defaultMessageFormatter = (message) => message.data;
var COMMON_ID = "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY";
var WS = class {
  constructor(options) {
    this.options = options;
    this.publicIsReconnecting = false;
    this.privateIsReconnecting = false;
    this.reconnectInterval = 1e3;
    this.authenticated = false;
    this._pendingPrivateSubscribe = [];
    this._pendingPublicSubscribe = [];
    this._eventHandlers = /* @__PURE__ */ new Map();
    this.send = (message) => {
      if (typeof message !== "string") {
        message = JSON.stringify(message);
      }
      if (typeof message === "undefined")
        return;
      if (this.publicSocket.readyState === WebSocket.OPEN) {
        this.publicSocket.send(message);
      } else {
        console.warn("WebSocket connection is not open. Cannot send message.");
      }
    };
    this.createPublicSC(options);
    if (!!options.accountId) {
      this.createPrivateSC(options);
    }
  }
  createPublicSC(options) {
    let url;
    if (typeof options.url === "string") {
      url = options.url;
    } else {
      url = WS_URL[options.networkId || "testnet"].public;
    }
    this.publicSocket = new WebSocket(`${url}${COMMON_ID}`);
    this.publicSocket.onopen = this.onOpen.bind(this);
    this.publicSocket.onmessage = this.onMessage.bind(this);
    this.publicSocket.onclose = this.onClose.bind(this);
    this.publicSocket.onerror = this.onError.bind(this);
  }
  createPrivateSC(options) {
    const url = WS_URL[options.networkId || "testnet"].private;
    this.privateSocket = new WebSocket(`${url}${options.accountId}`);
    this.privateSocket.onopen = this.onPrivateOpen.bind(this);
    this.privateSocket.onmessage = this.onMessage.bind(this);
    this.privateSocket.onerror = this.onPrivateError.bind(this);
  }
  onOpen(event) {
    console.log("WebSocket connection opened:");
    console.log(this._pendingPublicSubscribe);
    if (this._pendingPublicSubscribe.length > 0) {
      this._pendingPublicSubscribe.forEach(([params, cb]) => {
        this.subscribe(params, cb);
      });
      this._pendingPublicSubscribe = [];
    }
    this.publicIsReconnecting = false;
  }
  onPrivateOpen(event) {
    console.log("Private WebSocket connection opened:");
    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.subscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
    }
    this.privateIsReconnecting = false;
  }
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const commoneHandler = messageHandlers.get(message.event);
      if (commoneHandler) {
        commoneHandler.handle(message, this.send);
      } else {
        const eventhandler = this._eventHandlers.get(
          message.topic || message.event
        );
        if (eventhandler == null ? void 0 : eventhandler.callback) {
          eventhandler.callback.forEach((cb) => {
            const data = cb.formatter ? cb.formatter(message) : defaultMessageFormatter(message);
            if (data) {
              cb.onMessage(data);
            }
          });
        }
      }
    } catch (e) {
      console.log("WebSocket message received:", event.data);
    }
  }
  onClose(event) {
    console.log("WebSocket connection closed:", event.reason);
  }
  onError(event) {
    console.error("WebSocket error:", event);
    this._eventHandlers.forEach((value, key) => {
      if (!value.isPrivate) {
        this._pendingPublicSubscribe.push([value.params, value.callback]);
        this._eventHandlers.delete(key);
      }
    });
    this.reconnectPublic();
  }
  onPrivateError(event) {
    console.error("Private WebSocket error:", event);
    this._eventHandlers.forEach((value, key) => {
      if (value.isPrivate) {
        this._pendingPrivateSubscribe.push([value.params, value.callback]);
        this._eventHandlers.delete(key);
      }
    });
  }
  close() {
    var _a;
    this.publicSocket.close();
    (_a = this.privateSocket) == null ? void 0 : _a.close();
  }
  set accountId(accountId) {
  }
  authenticate(accountId) {
    return __async(this, null, function* () {
      var _a, _b;
      if (this.authenticated)
        return;
      if (!this.privateSocket) {
        console.error("private ws not connected");
        return;
      }
      const message = yield (_b = (_a = this.options).onSigntureRequest) == null ? void 0 : _b.call(_a, accountId);
      console.log("push auth message:", message);
      this.privateSocket.send(
        JSON.stringify({
          id: "auth",
          event: "auth",
          params: {
            orderly_key: message.publicKey,
            sign: message.signature,
            timestamp: message.timestamp
          }
        })
      );
    });
  }
  privateSubscribe(params, callback) {
  }
  subscribe(params, callback, once) {
    console.log("\u{1F449}", params, callback, this.publicSocket.readyState);
    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      callback.onUnsubscribe
    );
    if (this.publicSocket.readyState !== WebSocket.OPEN) {
      this._pendingPublicSubscribe.push([params, callback]);
      if (!once) {
        return () => {
          this.unsubscribe(subscribeMessage);
        };
      }
      return;
    }
    const topic = subscribeMessage.topic || subscribeMessage.event;
    const handler = this._eventHandlers.get(topic);
    const callbacks = __spreadProps(__spreadValues({}, callback), {
      onUnsubscribe
    });
    if (!handler) {
      this._eventHandlers.set(topic, {
        params,
        callback: [callbacks]
      });
    } else {
      handler.callback.push(callbacks);
    }
    this.publicSocket.send(JSON.stringify(subscribeMessage));
    if (!once) {
      return () => {
        this.unsubscribe(subscribeMessage);
      };
    }
  }
  onceSubscribe(params, callback) {
    this.subscribe(params, callback, true);
  }
  unsubscribe(parmas) {
    const topic = parmas.topic || parmas.event;
    const handler = this._eventHandlers.get(topic);
    console.log("\u{1F91C} unsubscribe", parmas, topic, handler);
    if (!!handler && Array.isArray(handler == null ? void 0 : handler.callback)) {
      if (handler.callback.length === 1) {
        const unsubscribeMessage = handler.callback[0].onUnsubscribe(topic);
        console.log("unsubscribeMessage", unsubscribeMessage);
        this.publicSocket.send(JSON.stringify(unsubscribeMessage));
        this._eventHandlers.delete(topic);
      } else {
        this._eventHandlers.set(topic, __spreadProps(__spreadValues({}, handler), {
          callback: handler.callback.slice(0, -1)
        }));
      }
    }
  }
  generateMessage(params, onUnsubscribe) {
    let subscribeMessage;
    if (typeof params === "string") {
      subscribeMessage = { event: "subscribe", topic: params };
    } else {
      subscribeMessage = params;
    }
    if (typeof onUnsubscribe !== "function") {
      if (typeof params === "string") {
        console.log("\u{1F449}", params);
        onUnsubscribe = () => ({ event: "unsubscribe", topic: params });
      } else {
        onUnsubscribe = () => ({ event: "unsubscribe", topic: params.topic });
      }
    }
    return [subscribeMessage, onUnsubscribe];
  }
  reconnectPublic() {
    if (this.publicIsReconnecting)
      return;
    this.publicIsReconnecting = true;
    console.log(`Reconnecting in ${this.reconnectInterval / 1e3} seconds...`);
    window.setTimeout(() => {
      console.log("Reconnecting...");
      this.createPublicSC(this.options);
    }, this.reconnectInterval);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WS,
  WebSocketClient,
  __ORDERLY_API_URL_KEY__,
  del,
  get,
  mutate,
  post,
  put
});
//# sourceMappingURL=index.js.map