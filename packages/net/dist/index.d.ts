import { Observable } from 'rxjs';

declare function get<R>(url: string, options?: RequestInit, getter?: (data: any) => R): Promise<R>;
declare function post(url: string, data: any, options?: Omit<RequestInit, "method">): Promise<any>;

type NetworkId = "testnet" | "mainnet";
type WSOptions = {
    url?: string;
    networkId?: NetworkId;
    accountId?: string;
};
declare class WS {
    private static __topicRefCountMap;
    private wsSubject;
    private authenticated;
    constructor(options: WSOptions);
    private createSubject;
    private bindSubscribe;
    private authenticate;
    send(message: any): void;
    observe<T>(topic: string): Observable<T>;
    observe<T>(topic: string, unsubscribe?: () => any): Observable<T>;
    observe<T>(params: {
        event: string;
    } & Record<string, any>, unsubscribe?: () => any): Observable<T>;
    privateObserve(topic: string): Observable<any>;
    private generateMessage;
}

declare const __ORDERLY_API_URL_KEY__: string;

export { WS, __ORDERLY_API_URL_KEY__, get, post };
