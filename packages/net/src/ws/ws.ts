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
  callback: WSMessageHandler[];
};

const defaultMessageFormatter = (message: any) => message.data;
const COMMON_ID = "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY";

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

  constructor(private options: WSOptions) {
    this.createPublicSC(options);

    if (!!options.accountId) {
      this.createPrivateSC(options);
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
    this.publicSocket = new WebSocket(
      `${this.options.publicUrl}/ws/stream/${COMMON_ID}`
    );
    this.publicSocket.onopen = this.onOpen.bind(this);
    this.publicSocket.onmessage = this.onPublicMessage.bind(this);
    this.publicSocket.onclose = this.onClose.bind(this);
    this.publicSocket.onerror = this.onError.bind(this);
  }

  private createPrivateSC(options: WSOptions) {
    console.log("to open private webSocket ---->>>>");

    this.options = options;

    this.privateSocket = new WebSocket(
      `${this.options.privateUrl}/v2/ws/private/stream/${options.accountId}`
    );
    this.privateSocket.onopen = this.onPrivateOpen.bind(this);
    this.privateSocket.onmessage = this.onPrivateMessage.bind(this);
    // this.privateSocket.onclose = this.onClose.bind(this);
    this.privateSocket.onerror = this.onPrivateError.bind(this);
  }

  private onOpen(event: Event) {
    console.log("WebSocket connection opened:");
    // console.log(this._pendingPublicSubscribe);
    if (this._pendingPublicSubscribe.length > 0) {
      this._pendingPublicSubscribe.forEach(([params, cb]) => {
        this.subscribe(params, cb);
      });
      this._pendingPublicSubscribe = [];
    }

    this.publicIsReconnecting = false;
  }

  private onPrivateOpen(event: Event) {
    console.log("Private WebSocket connection opened:");
    //auth
    this.authenticate(this.options.accountId!);
    this.privateIsReconnecting = false;
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
        const eventhandler = handlerMap.get(message.topic || message.event);
        if (eventhandler?.callback) {
          eventhandler.callback.forEach((cb) => {
            const data = cb.formatter
              ? cb.formatter(message)
              : defaultMessageFormatter(message);

            if (data) {
              cb.onMessage(data);
            }
          });
        }
      }
      // console.log("WebSocket message received:", message);
    } catch (e) {
      console.log("WebSocket message received:", e, event.data);
    }

    // You can process the received message here
  }

  private onPublicMessage(event: MessageEvent) {
    this.onMessage(event, this.publicSocket, this._eventHandlers);
  }

  private onPrivateMessage(event: MessageEvent) {
    this.onMessage(event, this.privateSocket!, this._eventPrivateHandlers);
  }

  private handlePendingPrivateTopic() {
    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.privateSubscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
    }
  }

  private onClose(event: CloseEvent) {
    console.log("WebSocket connection closed:", event.reason);
  }

  private onError(event: Event) {
    console.error("WebSocket error:", event);

    this._eventHandlers.forEach((value, key) => {
      if (!value.isPrivate) {
        this._pendingPublicSubscribe.push([value.params, value.callback]);
        this._eventHandlers.delete(key);
      }
    });

    this.reconnectPublic();
  }

  private onPrivateError(event: Event) {
    console.error("Private WebSocket error:", event);

    this._eventHandlers.forEach((value, key) => {
      if (value.isPrivate) {
        this._pendingPrivateSubscribe.push([value.params, value.callback]);
        this._eventHandlers.delete(key);
      }
    });
  }

  send = (message: any) => {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    if (typeof message === "undefined") return;
    if (this.publicSocket.readyState === WebSocket.OPEN) {
      this.publicSocket.send(message);
      // console.log("WebSocket message sent:", message);
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
    // console.log("👉", params, callback, this.publicSocket.readyState);

    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      (callback as WSMessageHandler).onUnsubscribe
    );

    if (this.publicSocket.readyState !== WebSocket.OPEN) {
      this._pendingPublicSubscribe.push([params, callback]);

      if (!once) {
        return () => {
          this.unsubscribePublic(subscribeMessage);
        };
      }
      return;
    }

    const topic = subscribeMessage.topic || subscribeMessage.event;

    const handler = this._eventHandlers.get(topic);
    const callbacks = {
      ...callback,
      onUnsubscribe,
    };

    if (!handler) {
      this._eventHandlers.set(topic, {
        params,
        callback: [callbacks],
      });
    } else {
      handler.callback.push(callbacks);
    }

    this.publicSocket.send(JSON.stringify(subscribeMessage));
    // this._subscriptionPublicTopics.push({params, cb: [cb]});

    if (!once) {
      return () => {
        this.unsubscribePublic(subscribeMessage);
      };
    }
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
    console.log("🤜 unsubscribe", parmas, topic, handler);

    if (!!handler && Array.isArray(handler?.callback)) {
      if (handler!.callback.length === 1) {
        const unsubscribeMessage = handler!.callback[0].onUnsubscribe(topic);

        // console.log("unsubscribeMessage", unsubscribeMessage);
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
        console.log("👉", params);

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
    console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
    window.setTimeout(() => {
      console.log("Reconnecting...");
      // this.publicIsReconnecting = false;

      this.createPublicSC(this.options);
    }, this.reconnectInterval);
  }
}
