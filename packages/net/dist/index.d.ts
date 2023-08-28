import { Observable } from 'rxjs';

declare function get<R>(url: string, options?: RequestInit, formatter?: (data: any) => R): Promise<R>;
declare function post(url: string, data: any, options?: Omit<RequestInit, "method">): Promise<any>;

type NetworkId = "testnet" | "mainnet";
type WSOptions = {
    url?: string;
    networkId?: NetworkId;
    accountId?: string;
    onSigntureRequest?: (accountId: string) => Promise<any>;
};
declare class WebSocketClient {
    private static __topicRefCountMap;
    private wsSubject;
    private privateWsSubject?;
    private authenticated;
    private _pendingPrivateSubscribe;
    constructor(options: WSOptions);
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

export { WebSocketClient, __ORDERLY_API_URL_KEY__, get, post };
