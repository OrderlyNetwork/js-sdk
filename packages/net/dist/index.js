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
      return res;
    }
    throw new Error(response.statusText);
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
  handle(message, webSocket) {
    throw new Error("Method not implemented.");
  }
};

// src/ws/handler/ping.ts
var PingHandler = class extends BaseHandler {
  handle(_, webSocket) {
    webSocket.send(JSON.stringify({ event: "pong", ts: Date.now() }));
  }
};

// src/ws/handler/handler.ts
var messageHandlers = /* @__PURE__ */ new Map([
  ["ping", new PingHandler()]
]);

// src/ws/ws.ts
var defaultMessageFormatter = (message) => message.data;
var COMMON_ID = "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY";
var TIME_OUT = 1e3 * 60 * 2;
var CONNECT_LIMIT = 5;
var WS = class {
  constructor(options) {
    this.options = options;
    this.publicIsReconnecting = false;
    this.privateIsReconnecting = false;
    this.reconnectInterval = 1e3;
    this.authenticated = false;
    this._pendingPrivateSubscribe = [];
    this._pendingPublicSubscribe = [];
    // all message handlers
    this._eventHandlers = /* @__PURE__ */ new Map();
    this._eventPrivateHandlers = /* @__PURE__ */ new Map();
    this._publicRetryCount = 0;
    this._privateRetryCount = 0;
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
    this.bindEvents();
  }
  bindEvents() {
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.onVisibilityChange.bind(this)
      );
    }
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onNetworkStatusChange.bind(this));
    }
  }
  onVisibilityChange() {
    if (document.visibilityState === "visible") {
      this.checkSocketStatus();
    }
  }
  onNetworkStatusChange() {
    if (navigator.onLine) {
      this.checkSocketStatus();
    }
  }
  /**
   * 判断当前连接状态，
   * 1、如果已断开则重连
   * 2、如果太久没有收到消息，则主动断开，并重连
   * 3、从后台返回、网络状态变化时，都走以下流程
   */
  checkSocketStatus() {
    var _a, _b;
    const now = Date.now();
    if (document.visibilityState !== "visible")
      return;
    if (!navigator.onLine)
      return;
    if (!this.publicIsReconnecting) {
      if (this.publicSocket.readyState === WebSocket.CLOSED) {
        this.reconnectPublic();
      } else {
        if (now - this._publicHeartbeatTime > TIME_OUT) {
          this.publicSocket.close();
        }
      }
    }
    if (!this.privateIsReconnecting) {
      if (((_a = this.privateSocket) == null ? void 0 : _a.readyState) === WebSocket.CLOSED) {
        this.reconnectPrivate();
      } else {
        if (this._privateHeartbeatTime && now - this._privateHeartbeatTime > TIME_OUT) {
          (_b = this.privateSocket) == null ? void 0 : _b.close();
        }
      }
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
  closePrivate() {
    var _a;
    this.authenticated = false;
    this._pendingPrivateSubscribe = [];
    this._eventPrivateHandlers.clear();
    (_a = this.privateSocket) == null ? void 0 : _a.close();
  }
  createPublicSC(options) {
    if (this.publicSocket && this.publicSocket.readyState === WebSocket.OPEN)
      return;
    this.publicSocket = new WebSocket(
      `${this.options.publicUrl}/ws/stream/${COMMON_ID}`
    );
    this.publicSocket.onopen = this.onOpen.bind(this);
    this.publicSocket.onmessage = this.onPublicMessage.bind(this);
    this.publicSocket.onclose = this.onPublicClose.bind(this);
    this.publicSocket.onerror = this.onPublicError.bind(this);
  }
  createPrivateSC(options) {
    if (this.privateSocket && this.privateSocket.readyState === WebSocket.OPEN)
      return;
    this.options = options;
    this.privateSocket = new WebSocket(
      `${this.options.privateUrl}/v2/ws/private/stream/${options.accountId}`
    );
    this.privateSocket.onopen = this.onPrivateOpen.bind(this);
    this.privateSocket.onmessage = this.onPrivateMessage.bind(this);
    this.privateSocket.onclose = this.onPrivateClose.bind(this);
    this.privateSocket.onerror = this.onPrivateError.bind(this);
  }
  onOpen(event) {
    if (this._pendingPublicSubscribe.length > 0) {
      this._pendingPublicSubscribe.forEach(([params, cb, isOnce]) => {
        this.subscribe(params, cb, isOnce);
      });
      this._pendingPublicSubscribe = [];
    }
    this.publicIsReconnecting = false;
    this._publicRetryCount = 0;
  }
  onPrivateOpen(event) {
    this.authenticate(this.options.accountId);
    this.privateIsReconnecting = false;
    this._privateRetryCount = 0;
  }
  onMessage(event, socket, handlerMap) {
    try {
      const message = JSON.parse(event.data);
      const commoneHandler = messageHandlers.get(message.event);
      if (message.event === "auth" && message.success) {
        this.authenticated = true;
        this.handlePendingPrivateTopic();
        return;
      }
      if (commoneHandler) {
        commoneHandler.handle(message, socket);
      } else {
        const topicKey = this.getTopicKeyFromMessage(message);
        const eventhandler = handlerMap.get(topicKey);
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
    }
  }
  onPublicMessage(event) {
    this.onMessage(event, this.publicSocket, this._eventHandlers);
    this._publicHeartbeatTime = Date.now();
  }
  onPrivateMessage(event) {
    this.onMessage(event, this.privateSocket, this._eventPrivateHandlers);
    this._privateHeartbeatTime = Date.now();
  }
  handlePendingPrivateTopic() {
    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.privateSubscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
    }
  }
  onPublicClose(event) {
    this._eventHandlers.forEach((value, key) => {
      value.callback.forEach((cb) => {
        this._pendingPublicSubscribe.push([value.params, cb, value.isOnce]);
      });
      this._eventHandlers.delete(key);
    });
    setTimeout(() => this.checkSocketStatus(), 0);
  }
  onPrivateClose(event) {
    if (this.privateIsReconnecting)
      return;
    this._eventPrivateHandlers.forEach((value, key) => {
      value.callback.forEach((cb) => {
        this._pendingPrivateSubscribe.push([value.params, cb, value.isOnce]);
      });
      this._eventPrivateHandlers.delete(key);
    });
    this.authenticated = false;
    setTimeout(() => this.checkSocketStatus(), 0);
  }
  onPublicError(event) {
    console.error("public WebSocket error:", event);
    this.publicIsReconnecting = false;
    if (this.publicSocket.readyState === WebSocket.OPEN) {
      this.publicSocket.close();
    } else {
      if (this._publicRetryCount > CONNECT_LIMIT)
        return;
      setTimeout(() => {
        this.reconnectPublic();
        this._publicRetryCount++;
      }, this._publicRetryCount * 1e3);
    }
    this.errorBoardscast(event, this._eventHandlers);
  }
  onPrivateError(event) {
    var _a;
    console.error("Private WebSocket error:", event);
    this.privateIsReconnecting = false;
    if (((_a = this.privateSocket) == null ? void 0 : _a.readyState) === WebSocket.OPEN) {
      this.privateSocket.close();
    } else {
      if (this._privateRetryCount > CONNECT_LIMIT)
        return;
      setTimeout(() => {
        this.reconnectPrivate();
        this._privateRetryCount++;
      }, this._privateRetryCount * 1e3);
    }
    this.errorBoardscast(event, this._eventPrivateHandlers);
  }
  errorBoardscast(error, eventHandlers) {
    eventHandlers.forEach((value) => {
      value.callback.forEach((cb) => {
        var _a;
        (_a = cb.onError) == null ? void 0 : _a.call(cb, error);
      });
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
    var _a;
    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      callback.onUnsubscribe
    );
    if (((_a = this.privateSocket) == null ? void 0 : _a.readyState) !== WebSocket.OPEN) {
      this._pendingPrivateSubscribe.push([params, callback]);
      return () => {
        this.unsubscribePrivate(subscribeMessage);
      };
    }
    const topic = subscribeMessage.topic || subscribeMessage.event;
    const handler = this._eventPrivateHandlers.get(topic);
    const callbacks = __spreadProps(__spreadValues({}, callback), {
      onUnsubscribe
    });
    if (!handler) {
      this._eventPrivateHandlers.set(topic, {
        params,
        callback: [callbacks]
      });
    } else {
      handler.callback.push(callbacks);
    }
    this.privateSocket.send(JSON.stringify(subscribeMessage));
    return () => {
      this.unsubscribePrivate(subscribeMessage);
    };
  }
  subscribe(params, callback, once) {
    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      callback.onUnsubscribe
    );
    if (this.publicSocket.readyState !== WebSocket.OPEN) {
      this._pendingPublicSubscribe.push([params, callback, once]);
      if (!once) {
        return () => {
          this.unsubscribePublic(subscribeMessage);
        };
      }
      return;
    }
    let topic = this.getTopicKeyFromParams(subscribeMessage);
    const handler = this._eventHandlers.get(topic);
    const callbacks = __spreadProps(__spreadValues({}, callback), {
      onUnsubscribe
    });
    if (!handler) {
      this._eventHandlers.set(topic, {
        params,
        isOnce: once,
        callback: [callbacks]
      });
      this.publicSocket.send(JSON.stringify(subscribeMessage));
    } else {
      if (once) {
        handler.callback = [callbacks];
        this.publicSocket.send(JSON.stringify(subscribeMessage));
      } else {
        handler.callback.push(callbacks);
      }
    }
    if (!once) {
      return () => {
        this.unsubscribePublic(subscribeMessage);
      };
    }
  }
  getTopicKeyFromParams(params) {
    let topic;
    if (params.topic) {
      topic = params.topic;
    } else {
      const eventName = params.event;
      topic = params.event;
      if (params.id) {
        topic += `_${params.id}`;
      }
    }
    return topic;
  }
  getTopicKeyFromMessage(message) {
    let topic;
    if (message.topic) {
      topic = message.topic;
    } else {
      if (message.event) {
        topic = `${message.event}`;
        if (message.id) {
          topic += `_${message.id}`;
        }
      }
    }
    return topic;
  }
  // sendPublicMessage(){
  //   if(this.publicSocket.readyState !== )
  // }
  onceSubscribe(params, callback) {
    this.subscribe(params, callback, true);
  }
  unsubscribe(parmas, webSocket, handlerMap) {
    const topic = parmas.topic || parmas.event;
    const handler = handlerMap.get(topic);
    if (!!handler && Array.isArray(handler == null ? void 0 : handler.callback)) {
      if (handler.callback.length === 1) {
        const unsubscribeMessage = handler.callback[0].onUnsubscribe(topic);
        webSocket.send(JSON.stringify(unsubscribeMessage));
        handlerMap.delete(topic);
      } else {
        handlerMap.set(topic, __spreadProps(__spreadValues({}, handler), {
          callback: handler.callback.slice(0, -1)
        }));
      }
    }
  }
  unsubscribePrivate(parmas) {
    this.unsubscribe(parmas, this.privateSocket, this._eventPrivateHandlers);
  }
  unsubscribePublic(parmas) {
    this.unsubscribe(parmas, this.publicSocket, this._eventHandlers);
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
    window.setTimeout(() => {
      this.createPublicSC(this.options);
    }, this.reconnectInterval);
  }
  reconnectPrivate() {
    if (!this.options.accountId)
      return;
    if (this.privateIsReconnecting)
      return;
    this.privateIsReconnecting = true;
    window.setTimeout(() => {
      this.createPrivateSC(this.options);
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