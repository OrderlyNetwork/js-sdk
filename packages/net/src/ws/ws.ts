import { messageHandlers } from "./handler/handler";

export type NetworkId = "testnet" | "mainnet";

export type WSOptions = {
  privateUrl: string;
  publicUrl: string;
  networkId?: NetworkId;
  accountId?: string;

  onSigntureRequest?: (accountId: string) => Promise<any>;
};

export type unsubscribe = () => void;

export type MessageParams = {
  event: string;
  topic: string;

  params?: any;
  // [key: string]: any;
};

type WSMessageHandler = {
  onMessage: (message: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: any) => void;
  onUnsubscribe: (event: any) => any;
  formatter?: (message: any) => any;
};

type Topics = {
  params: MessageParams;
  isPrivate?: boolean;
  isOnce?: boolean;
  callback: WSMessageHandler[];
};

const defaultMessageFormatter = (message: any) => message.data;
const COMMON_ID = "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY";

const TIME_OUT = 1000 * 60 * 2;
const CONNECT_LIMIT = 5;

export class WS {
  private publicSocket!: WebSocket;
  private privateSocket?: WebSocket;

  private publicIsReconnecting: boolean = false;
  private privateIsReconnecting: boolean = false;

  private reconnectInterval: number = 1000;

  private authenticated: boolean = false;

  private _pendingPrivateSubscribe: any[][] = [];
  private _pendingPublicSubscribe: any[][] = [];

  // all message handlers
  private _eventHandlers: Map<string, Topics> = new Map();
  private _eventPrivateHandlers: Map<string, Topics> = new Map();

  private _publicHeartbeatTime?: number;
  private _privateHeartbeatTime?: number;

  private _publicRetryCount: number = 0;
  private _privateRetryCount: number = 0;

  constructor(private options: WSOptions) {
    this.createPublicSC(options);

    if (!!options.accountId) {
      this.createPrivateSC(options);
    }

    this.bindEvents();
  }

  private bindEvents() {
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        this.onVisibilityChange.bind(this)
      );
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onNetworkStatusChange.bind(this));
      // window.addEventListener("offline", this.onNetworkStatusChange);
    }
  }

  private onVisibilityChange() {
    if (document.visibilityState === "visible") {
      this.checkSocketStatus();
    }
    // else {
    //   this.publicSocket.close();
    //   this.privateSocket?.close();
    // }
  }

  private onNetworkStatusChange() {
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
  private checkSocketStatus() {
    const now = Date.now();

    //
    //   "👀👀 checkNetworkStatus 👀👀",
    //   this._publicHeartbeatTime,
    //   this._privateHeartbeatTime,
    //   now,
    //   this.publicSocket.readyState,
    //   this.privateSocket?.readyState
    // );

    // check the last time
    // 如果容器不可见，则不做处理
    if (document.visibilityState !== "visible") return;
    // 如果网络不可用，则不做处理
    if (!navigator.onLine) return;

    // 如果已断开，则重连
    // public
    if (!this.publicIsReconnecting) {
      if (this.publicSocket.readyState === WebSocket.CLOSED) {
        this.reconnectPublic();
      } else {
        if (now - this._publicHeartbeatTime! > TIME_OUT) {
          //unsubscribe all public topic
          this.publicSocket.close();
        }
      }
    }

    if (!this.privateIsReconnecting) {
      // private
      if (this.privateSocket?.readyState === WebSocket.CLOSED) {
        this.reconnectPrivate();
      } else {
        if (
          this._privateHeartbeatTime &&
          now - this._privateHeartbeatTime! > TIME_OUT
        ) {
          // unsubscribe all private topic
          this.privateSocket?.close();
        }
      }
    }
  }

  public openPrivate(accountId: string) {
    if (this.privateSocket?.readyState === WebSocket.OPEN) {
      return;
    }
    this.createPrivateSC({
      ...this.options,
      accountId,
    });
  }

  public closePrivate() {
    this.authenticated = false;
    this._pendingPrivateSubscribe = [];

    this._eventPrivateHandlers.clear();

    this.privateSocket?.close();
  }

  private createPublicSC(options: WSOptions) {
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

  private createPrivateSC(options: WSOptions) {
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

  private onOpen(event: Event) {
    //
    if (this._pendingPublicSubscribe.length > 0) {
      this._pendingPublicSubscribe.forEach(([params, cb, isOnce]) => {
        this.subscribe(params, cb, isOnce);
      });
      this._pendingPublicSubscribe = [];
    }

    this.publicIsReconnecting = false;
    this._publicRetryCount = 0;
  }

  private onPrivateOpen(event: Event) {
    //auth
    this.authenticate(this.options.accountId!);
    this.privateIsReconnecting = false;
    this._privateRetryCount = 0;
  }

  private onMessage(
    event: MessageEvent,
    socket: WebSocket,
    handlerMap: Map<string, Topics>
  ) {
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
        //
        if (eventhandler?.callback) {
          eventhandler.callback.forEach((cb) => {
            const data = cb.formatter
              ? cb.formatter(message)
              : defaultMessageFormatter(message);

            if (data) {
              cb.onMessage(data);
            }
          });

          // 延时删除，在重连时还需要用到
          // if (eventhandler.isOnce) {
          //   handlerMap.delete(topicKey);
          // }
        }
      }

      //
    } catch (e) {}

    // You can process the received message here
  }

  private onPublicMessage(event: MessageEvent) {
    this.onMessage(event, this.publicSocket, this._eventHandlers);
    // 更新最后收到消息的时间
    this._publicHeartbeatTime = Date.now();
  }

  private onPrivateMessage(event: MessageEvent) {
    this.onMessage(event, this.privateSocket!, this._eventPrivateHandlers);
    // 更新最后收到消息的时间
    this._privateHeartbeatTime = Date.now();
  }

  private handlePendingPrivateTopic() {
    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.privateSubscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
    }
  }

  private onPublicClose(event: CloseEvent) {
    // move handler to pending
    this._eventHandlers.forEach((value, key) => {
      value.callback.forEach((cb) => {
        this._pendingPublicSubscribe.push([value.params, cb, value.isOnce]);
      });

      this._eventHandlers.delete(key);
    });

    setTimeout(() => this.checkSocketStatus(), 0);
  }

  private onPrivateClose(event: CloseEvent) {
    if (this.privateIsReconnecting) return;
    this._eventPrivateHandlers.forEach((value, key) => {
      value.callback.forEach((cb) => {
        this._pendingPrivateSubscribe.push([value.params, cb, value.isOnce]);
      });

      this._eventPrivateHandlers.delete(key);
    });
    this.authenticated = false;

    setTimeout(() => this.checkSocketStatus(), 0);
  }

  private onPublicError(event: Event) {
    console.error("public WebSocket error:", event);
    this.publicIsReconnecting = false;

    if (this.publicSocket.readyState === WebSocket.OPEN) {
      this.publicSocket.close();
    } else {
      // retry connect
      if (this._publicRetryCount > CONNECT_LIMIT) return;
      setTimeout(() => {
        // this.createPublicSC(this.options);
        this.reconnectPublic();
        this._publicRetryCount++;
      }, this._publicRetryCount * 1000);
    }

    this.errorBoardscast(event, this._eventHandlers);
  }

  private onPrivateError(event: Event) {
    console.error("Private WebSocket error:", event);
    this.privateIsReconnecting = false;

    if (this.privateSocket?.readyState === WebSocket.OPEN) {
      this.privateSocket.close();
    } else {
      // retry connect
      if (this._privateRetryCount > CONNECT_LIMIT) return;
      setTimeout(() => {
        // this.createPublicSC(this.options);
        this.reconnectPrivate();
        this._privateRetryCount++;
      }, this._privateRetryCount * 1000);
    }

    this.errorBoardscast(event, this._eventPrivateHandlers);
  }

  private errorBoardscast(error: any, eventHandlers: Map<string, Topics>) {
    eventHandlers.forEach((value) => {
      value.callback.forEach((cb) => {
        cb.onError?.(error);
      });
    });
  }

  send = (message: any) => {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    if (typeof message === "undefined") return;
    if (this.publicSocket.readyState === WebSocket.OPEN) {
      this.publicSocket.send(message);
      //
    } else {
      console.warn("WebSocket connection is not open. Cannot send message.");
    }
  };

  close() {
    this.publicSocket.close();
    this.privateSocket?.close();
  }

  set accountId(accountId: string) {}

  private async authenticate(accountId: string) {
    if (this.authenticated) return;
    if (!this.privateSocket) {
      console.error("private ws not connected");
      return;
    }

    const message = await this.options.onSigntureRequest?.(accountId);

    this.privateSocket.send(
      JSON.stringify({
        id: "auth",
        event: "auth",
        params: {
          orderly_key: message.publicKey,
          sign: message.signature,
          timestamp: message.timestamp,
        },
      })
    );
    // this.wsSubject.next({ type: "authenticate" });
    // this.authenticated = true;
  }

  privateSubscribe(
    params: any,
    callback: WSMessageHandler | Omit<WSMessageHandler, "onUnsubscribe">
  ) {
    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      (callback as WSMessageHandler).onUnsubscribe
    );

    if (this.privateSocket?.readyState !== WebSocket.OPEN) {
      this._pendingPrivateSubscribe.push([params, callback]);
      return () => {
        this.unsubscribePrivate(subscribeMessage);
      };
    }

    const topic = subscribeMessage.topic || subscribeMessage.event;

    const handler = this._eventPrivateHandlers.get(topic);
    const callbacks = {
      ...callback,
      onUnsubscribe,
    };

    if (!handler) {
      this._eventPrivateHandlers.set(topic, {
        params,
        callback: [callbacks],
      });
    } else {
      handler.callback.push(callbacks);
    }

    this.privateSocket.send(JSON.stringify(subscribeMessage));

    return () => {
      this.unsubscribePrivate(subscribeMessage);
    };
  }

  subscribe(
    params: any,
    callback: WSMessageHandler | Omit<WSMessageHandler, "onUnsubscribe">,
    once?: boolean
  ): unsubscribe | undefined {
    //

    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      (callback as WSMessageHandler).onUnsubscribe
    );

    //

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
    // const topic = subscribeMessage.topic || subscribeMessage.event;

    const handler = this._eventHandlers.get(topic);
    const callbacks = {
      ...callback,
      onUnsubscribe,
    };

    if (!handler) {
      this._eventHandlers.set(topic, {
        params,
        isOnce: once,
        callback: [callbacks],
      });
      this.publicSocket.send(JSON.stringify(subscribeMessage));
    } else {
      // 是否once,如果是once,则替换掉之前的callback
      if (once) {
        handler.callback = [callbacks];
        this.publicSocket.send(JSON.stringify(subscribeMessage));
      } else {
        handler.callback.push(callbacks);
      }
    }

    // this._subscriptionPublicTopics.push({params, cb: [cb]});

    if (!once) {
      return () => {
        this.unsubscribePublic(subscribeMessage);
      };
    }
  }

  private getTopicKeyFromParams(params: any): string {
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

  private getTopicKeyFromMessage(message: any): string {
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

  onceSubscribe(
    params: any,
    callback: Omit<WSMessageHandler, "onUnsubscribe">
  ) {
    this.subscribe(params, callback, true);
  }

  private unsubscribe(
    parmas: MessageParams,
    webSocket: WebSocket,
    handlerMap: Map<string, Topics>
  ) {
    const topic = parmas.topic || parmas.event;
    const handler = handlerMap.get(topic);

    if (!!handler && Array.isArray(handler?.callback)) {
      if (handler!.callback.length === 1) {
        const unsubscribeMessage = handler!.callback[0].onUnsubscribe(topic);

        //
        webSocket.send(JSON.stringify(unsubscribeMessage));
        handlerMap.delete(topic);
        //post unsubscribe message
      } else {
        handlerMap.set(topic, {
          ...handler,
          callback: handler.callback.slice(0, -1),
        });
      }
    }
  }

  private unsubscribePrivate(parmas: MessageParams) {
    this.unsubscribe(parmas, this.privateSocket!, this._eventPrivateHandlers);
  }

  private unsubscribePublic(parmas: MessageParams) {
    this.unsubscribe(parmas, this.publicSocket, this._eventHandlers);
  }

  private generateMessage(
    params: any,
    onUnsubscribe?: (event: string) => any
  ): [MessageParams, (event: string) => any] {
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

  private reconnectPublic() {
    if (this.publicIsReconnecting) return;
    this.publicIsReconnecting = true;

    window.setTimeout(() => {
      this.createPublicSC(this.options);
    }, this.reconnectInterval);
  }

  private reconnectPrivate() {
    if (!this.options.accountId) return;
    if (this.privateIsReconnecting) return;
    this.privateIsReconnecting = true;

    window.setTimeout(() => {
      this.createPrivateSC(this.options);
    }, this.reconnectInterval);
  }
}
