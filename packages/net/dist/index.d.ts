import { Observable } from 'rxjs';

declare function get(url: string, options?: any): Promise<any>;
declare function post(url: string, data: any, options?: any): Promise<any>;

type NetworkId = "testnet" | "mainnet";
type WSOptions = {
    url?: string;
    networkId?: NetworkId;
    accountId?: string;
};
declare class WS {
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

export { WS, get, post };
