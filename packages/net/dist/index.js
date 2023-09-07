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

// src/constants.ts
var __ORDERLY_API_URL_KEY__ = "__ORDERLY_API_URL__";

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
  openPrivate(accountId) {
    var _a;
    if (((_a = this.privateSocket) == null ? void 0 : _a.readyState) === WebSocket.OPEN) {
      return;
    }
    this.createPrivateSC(__spreadProps(__spreadValues({}, this.options), {
      accountId
    }));
  }
  createPublicSC(options) {
    this.publicSocket = new WebSocket(
      `${this.options.publicUrl}/ws/stream/${COMMON_ID}`
    );
    this.publicSocket.onopen = this.onOpen.bind(this);
    this.publicSocket.onmessage = this.onMessage.bind(this);
    this.publicSocket.onclose = this.onClose.bind(this);
    this.publicSocket.onerror = this.onError.bind(this);
  }
  createPrivateSC(options) {
    console.log("to open private webSocket ---->>>>");
    this.options = options;
    this.privateSocket = new WebSocket(
      `${this.options.privateUrl}/v2/ws/private/stream/${options.accountId}`
    );
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
    this.authenticate(this.options.accountId);
    this.privateIsReconnecting = false;
  }
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const commoneHandler = messageHandlers.get(message.event);
      if (message.event === "auth" && message.success) {
        this.authenticated = true;
        this.handlePendingPrivateTopic();
        return;
      }
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
  handlePendingPrivateTopic() {
    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.privateSubscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
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
  privateSubscribe(params, callback, once) {
    var _a, _b;
    console.log("\u{1F449}", params, callback, (_a = this.privateSocket) == null ? void 0 : _a.readyState);
    if (((_b = this.privateSocket) == null ? void 0 : _b.readyState) !== WebSocket.OPEN) {
      this._pendingPrivateSubscribe.push([params, callback]);
      return;
    }
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
  // sendPublicMessage(){
  //   if(this.publicSocket.readyState !== )
  // }
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
  __ORDERLY_API_URL_KEY__,
  del,
  get,
  mutate,
  post,
  put
});
//# sourceMappingURL=index.js.map