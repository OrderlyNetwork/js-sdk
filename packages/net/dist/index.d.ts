import { Observable } from 'rxjs';

declare function get<R>(url: string, options?: RequestInit, formatter?: (data: any) => R): Promise<R>;
declare function post(url: string, data: any, options?: Omit<RequestInit, "method">): Promise<any>;
declare function del(url: string, data: any, options?: Omit<RequestInit, "method">): Promise<any>;

type NetworkId$1 = "testnet" | "mainnet";
type WSOptions$1 = {
    url?: string;
    networkId?: NetworkId$1;
    accountId?: string;
    onSigntureRequest?: (accountId: string) => Promise<any>;
};
declare class WebSocketClient {
    private static __topicRefCountMap;
    private wsSubject;
    private privateWsSubject?;
    private authenticated;
    private _pendingPrivateSubscribe;
    constructor(options: WSOptions$1);
    private createSubject;
    private createPrivateSubject;
    private bindSubscribe;
    private authenticate;
    send: (message: any) => void;
    privateSend: (message: any) => void;
    get isAuthed(): boolean;
    observe<T>(params: any, unsubscribe?: () => any, messageFilter?: (value: T) => boolean): Observable<T>;
    privateObserve<T>(params: any, unsubscribe?: () => any, messageFilter?: (value: T) => boolean): Observable<T>;
    private _observe;
    private generateMessage;
    private _sendPendingPrivateMessage;
    desotry(): void;
}

declare const __ORDERLY_API_URL_KEY__: string;

type NetworkId = "testnet" | "mainnet";
type WSOptions = {
    url?: string;
    networkId?: NetworkId;
    accountId?: string;
    onSigntureRequest?: (accountId: string) => Promise<any>;
};
type unsubscribe = () => void;
type WSMessageHandler = {
    onMessage: (message: any) => void;
    onError?: (error: any) => void;
    onClose?: (event: any) => void;
    onUnsubscribe: (event: any) => any;
    formatter?: (message: any) => any;
};
declare class WS {
    private readonly options;
    private publicSocket;
    private privateSocket?;
    private publicIsReconnecting;
    private privateIsReconnecting;
    private reconnectInterval;
    private authenticated;
    private _pendingPrivateSubscribe;
    private _pendingPublicSubscribe;
    private _eventHandlers;
    constructor(options: WSOptions);
    private createPublicSC;
    private createPrivateSC;
    private onOpen;
    private onPrivateOpen;
    private onMessage;
    private onClose;
    private onError;
    private onPrivateError;
    send: (message: any) => void;
    close(): void;
    set accountId(accountId: string);
    private authenticate;
    privateSubscribe(params: any, callback: WSMessageHandler): void;
    subscribe(params: any, callback: WSMessageHandler | Omit<WSMessageHandler, "onUnsubscribe">, once?: boolean): unsubscribe | undefined;
    onceSubscribe(params: any, callback: Omit<WSMessageHandler, "onUnsubscribe">): void;
    private unsubscribe;
    private generateMessage;
    private reconnectPublic;
}

export { NetworkId$1 as NetworkId, WS, WSOptions$1 as WSOptions, WebSocketClient, __ORDERLY_API_URL_KEY__, del, get, post };
