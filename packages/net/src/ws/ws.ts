import { WS_URL } from "./contants";
import { messageHandlers } from "./handler/handler";

export type NetworkId = "testnet" | "mainnet";

export type WSOptions = {
  url?: string;
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

  private _eventHandlers: Map<string, Topics> = new Map();

  constructor(private readonly options: WSOptions) {
    this.createPublicSC(options);

    if (!!options.accountId) {
      this.createPrivateSC(options);
    }
  }

  private createPublicSC(options: WSOptions) {
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

  private createPrivateSC(options: WSOptions) {
    const url = WS_URL[options.networkId || "testnet"].private;
    this.privateSocket = new WebSocket(`${url}${options.accountId}`);
    this.privateSocket.onopen = this.onPrivateOpen.bind(this);
    this.privateSocket.onmessage = this.onMessage.bind(this);
    // this.privateSocket.onclose = this.onClose.bind(this);
    this.privateSocket.onerror = this.onPrivateError.bind(this);
  }

  private onOpen(event: Event) {
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

  private onPrivateOpen(event: Event) {
    console.log("Private WebSocket connection opened:");

    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.subscribe(params, cb);
      });
      this._pendingPrivateSubscribe = [];
    }

    this.privateIsReconnecting = false;
  }

  private onMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      const commoneHandler = messageHandlers.get(message.event);

      if (commoneHandler) {
        commoneHandler.handle(message, this.send);
      } else {
        const eventhandler = this._eventHandlers.get(
          message.topic || message.event
        );
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
      console.log("WebSocket message received:", event.data);
    }

    // You can process the received message here
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

    console.log("push auth message:", message);
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

  privateSubscribe(params: any, callback: WSMessageHandler) {}

  subscribe(
    params: any,
    callback: WSMessageHandler | Omit<WSMessageHandler, "onUnsubscribe">,
    once?: boolean
  ): unsubscribe | undefined {
    console.log("👉", params, callback, this.publicSocket.readyState);

    const [subscribeMessage, onUnsubscribe] = this.generateMessage(
      params,
      (callback as WSMessageHandler).onUnsubscribe
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
        this.unsubscribe(subscribeMessage);
      };
    }
  }

  onceSubscribe(
    params: any,
    callback: Omit<WSMessageHandler, "onUnsubscribe">
  ) {
    this.subscribe(params, callback, true);
  }

  private unsubscribe(parmas: MessageParams) {
    const topic = parmas.topic || parmas.event;
    const handler = this._eventHandlers.get(topic);
    console.log("🤜 unsubscribe", parmas, topic, handler);

    if (!!handler && Array.isArray(handler?.callback)) {
      if (handler!.callback.length === 1) {
        const unsubscribeMessage = handler!.callback[0].onUnsubscribe(topic);

        console.log("unsubscribeMessage", unsubscribeMessage);
        this.publicSocket.send(JSON.stringify(unsubscribeMessage));
        this._eventHandlers.delete(topic);
        //post unsubscribe message
      } else {
        this._eventHandlers.set(topic, {
          ...handler,
          callback: handler.callback.slice(0, -1),
        });
      }
    }
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
