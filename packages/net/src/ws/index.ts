import { type WebSocketSubject, webSocket } from "rxjs/webSocket";

import { WS_URL } from "./contants";
import { Observable, Observer, Subject, tap } from "rxjs";
import { messageHandlers } from "@/ws/handler/handler";

export type NetworkId = "testnet" | "mainnet";

export type WSOptions = {
  url?: string;
  networkId?: NetworkId;
  accountId?: string;
};
class WS {
  private wsSubject: WebSocketSubject<any>;

  private authenticated: boolean = false;

  constructor(options: WSOptions) {
    this.wsSubject = this.createSubject(options);

    this.bindSubscribe();
  }
  private createSubject(options: WSOptions): WebSocketSubject<any> {
    let url;
    if (typeof options.url === "string") {
      url = options.url;
    } else {
      url = WS_URL[options.networkId || "testnet"].public;
    }

    return webSocket({
      url,
      openObserver: {
        next: () => {
          console.log("Connection ok");
        },
      },
      closeObserver: {
        next: () => {
          console.log("Connection closed");
        },
      },
    });
  }

  private bindSubscribe() {
    /// 处理ping,auth等消息
    this.wsSubject.subscribe((message) => {
      const handler = messageHandlers.get(message.event);
      if (handler) {
        handler.handle(message, this.send.bind(this));
      }
    });
  }

  private authenticate() {
    if (this.authenticated) return;
    this.wsSubject.next({ type: "authenticate" });
    this.authenticated = true;
  }

  send(message: any) {
    this.wsSubject.next(message);
  }

  observe<T>(topic: string): Observable<T>;
  observe<T>(topic: string, unsubscribe?: () => any): Observable<T>;
  observe<T>(
    params: {
      event: string;
    } & Record<string, any>,
    unsubscribe?: () => any
  ): Observable<T>;
  observe<T>(
    params: any,
    unsubscribe?: () => any,
    messageFilter?: (value: T) => boolean
  ): Observable<T> {
    const [subscribeMessage, unsubscribeMessage, filter] = this.generateMessage(
      params,
      unsubscribe,
      messageFilter
    );

    return new Observable((observer: Observer<T>) => {
      try {
        this.send(subscribeMessage);
      } catch (err) {
        observer.error(err);
      }

      const subscription = this.wsSubject.subscribe({
        next: (x) => {
          try {
            if (filter(x)) {
              observer.next(x);
            }
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });

      return () => {
        try {
          console.log("******* unsubscribe", unsubscribeMessage);
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

  privateObserve(topic: string): Observable<any> {
    return this.observe(topic);
  }

  private generateMessage(
    params: any,
    unsubscribe?: () => any,
    messageFilter?: (value: any) => boolean
  ): [Record<string, any>, Record<string, any>, (message: any) => boolean] {
    let subscribeMessage: Record<string, any>,
      unsubscribeMessage: Record<string, any>;
    let filter: (message: any) => boolean;

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

    return [subscribeMessage, unsubscribeMessage, filter];
  }
}

export default WS;
