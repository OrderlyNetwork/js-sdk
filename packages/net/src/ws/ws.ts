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

type WSMessageHandler = {
  onMessage: (message: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: any) => void;
  onUnsubscribe: (event: any) => string;
  formatter?: (message: any) => any;
};

type Topics = {
  params: any;
  isPrivate?: boolean;
  cb: WSMessageHandler[];
};

const defaultMessageFormatter = (message: any) => message.data;

export class WS {
  private publicSocket!: WebSocket;
  private privateSocket?: WebSocket;

  private publicIsReconnecting: boolean = false;
  private privateIsReconnecting: boolean = false;

  private publicReconnectTimeout?: number;
  private privateReconnectTimeout?: number;

  private reconnectInterval: number = 1000;

  private authenticated: boolean = false;

  private _pendingPrivateSubscribe: any[][] = [];
  private _pendingPublicSubscribe: any[][] = [];

  private _subscriptionPublicTopics: Topics[] = [];
  private _subscriptionPrivateTopics: Topics[] = [];

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
    this.publicSocket = new WebSocket(`${url}${options.accountId}`);
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
        this.subscription(params, cb);
      });
      this._pendingPublicSubscribe = [];
    }

    this.publicIsReconnecting = false;
  }

  private onPrivateOpen(event: Event) {
    console.log("Private WebSocket connection opened:");

    if (this._pendingPrivateSubscribe.length > 0) {
      this._pendingPrivateSubscribe.forEach(([params, cb]) => {
        this.subscription(params, cb);
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
        const eventhandler = this._eventHandlers.get(message.topic);
        if (eventhandler?.cb) {
          eventhandler.cb.forEach((cb) => {
            const data = cb.formatter
              ? cb.formatter(message)
              : defaultMessageFormatter(message);
            cb.onMessage(data);
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
        this._pendingPublicSubscribe.push([value.params, value.cb]);
        this._eventHandlers.delete(key);
      }
    });

    this.reconnectPublic();
  }

  private onPrivateError(event: Event) {
    console.error("Private WebSocket error:", event);

    this._eventHandlers.forEach((value, key) => {
      if (value.isPrivate) {
        this._pendingPrivateSubscribe.push([value.params, value.cb]);
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
      console.log("WebSocket message sent:", message);
    } else {
      console.warn("WebSocket connection is not open. Cannot send message.");
    }
  };

  close() {
    this.publicSocket.close();
    this.privateSocket?.close();
  }

  private authenticate(
    accountId: string,
    message: {
      publicKey: string;
      signature: string;
      timestamp: number;
    }
  ) {
    if (this.authenticated) return;
    if (!this.privateSocket) {
      console.error("private ws not connected");
      return;
    }

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

  privateSubscription(params: any, cb: WSMessageHandler) {}

  subscription(params: any, cb: WSMessageHandler): unsubscribe {
    const [subscribeMessage, unsubscribeMessage, filter, messageFormatter] =
      this.generateMessage(params);

    const unsubscribe = () => {
      console.log("unsubscribeMessage", unsubscribeMessage);
      this.publicSocket.send(JSON.stringify(unsubscribeMessage));
    };

    if (this.publicSocket.readyState !== WebSocket.OPEN) {
      this._pendingPublicSubscribe.push([params, cb]);
      return unsubscribe;
    }

    const handler = this._eventHandlers.get(subscribeMessage.topic);

    if (!handler) {
      this._eventHandlers.set(subscribeMessage.topic, {
        params,
        cb: [cb],
      });
    } else {
      handler.cb.push(cb);
    }

    this.publicSocket.send(JSON.stringify(subscribeMessage));
    // this._subscriptionPublicTopics.push({params, cb: [cb]});

    return unsubscribe;
  }

  private generateMessage(
    params: any,
    unsubscribe?: () => any,
    messageFilter?: (value: any) => boolean
  ): [
    Record<string, any>,
    Record<string, any>,
    (message: any) => boolean,
    (message: any) => any
  ] {
    let subscribeMessage: Record<string, any>,
      unsubscribeMessage: Record<string, any>;
    let filter: (message: any) => boolean,
      messageFormatter: (message: any) => any = (message: any) => message.data;

    if (typeof params === "string") {
      subscribeMessage = { event: "subscribe", topic: params };
      unsubscribeMessage = { event: "unsubscribe", topic: params };
      filter = (message: any) => message.topic === params;
    } else {
      subscribeMessage = params;
      unsubscribeMessage =
        typeof unsubscribe === "function" ? unsubscribe() : unsubscribe;
      filter = messageFilter || ((message: any) => true);
    }

    return [subscribeMessage, unsubscribeMessage, filter, messageFormatter];
  }

  private reconnectPublic() {
    if (this.publicIsReconnecting) return;
    this.publicIsReconnecting = true;
    console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
    this.publicReconnectTimeout = window.setTimeout(() => {
      console.log("Reconnecting...");
      // this.publicIsReconnecting = false;

      this.createPublicSC(this.options);
    }, this.reconnectInterval);
  }
}
