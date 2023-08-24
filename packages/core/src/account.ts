import { BehaviorSubject } from "rxjs";
import { getMockSigner } from "./helper";
import { MessageFactor } from "./signer";
import { SimpleWallet, WalletClient } from "./wallet";
import { ConfigStore } from "./configStore";

export type AccountStatus =
  | "NotConnected"
  | "Connected"
  | "NotSignedIn"
  | "SignedIn";

export enum AccountStatusEnum {
  NotConnected = 0,
  Connected = 1,
  NotSignedIn = 2,
  SignedIn = 3,
  EnableTrading = 4,
}

export interface AccountState {
  status: AccountStatus;

  accountId?: string;
  userId?: string;
  address?: string;

  balance: string;
  leverage: number;

  // portfolio
  // 仓位 id[]
  positon?: string[];
  // 挂单 id[]
  orders?: string[];
}

/**
 * 账户
 * @example
 * ```ts
 * const account = new Account();
 * account.login("0x1234567890");
 * ```
 */
export class Account {
  //   wallet?: WalletClient;
  private _state$ = new BehaviorSubject<AccountState>({
    status: "NotConnected",

    balance: "",
    leverage: Number.NaN,
  });

  // private config =

  constructor(
    private readonly configStore: ConfigStore,
    private walletClient?: WalletClient
  ) {
    if (walletClient) {
      this._checkAccount();
    }
  }

  /**
   * 登录
   * @param address 钱包地址
   */
  login(address: string) {
    if (!address) throw new Error("address is required");
    this._state$.next({
      ...this.stateValue,
      status: "SignedIn",
      address,
    });
    this.wallet = address;
  }

  logout() {
    // ...
  }

  /**
   * 连接钱包先用第三方的React版本，不用自己实现
   */
  // connectWallet() {
  //   // this.wallet.connect();
  // }

  /**
   * 为账户设置钱包
   */
  set wallet(wallet: WalletClient | string) {
    // 如果是字符串，就是钱包地址，使用SimpleWallet初始化
    if (typeof wallet === "string") {
      this.walletClient = new SimpleWallet(wallet);
    } else {
      this.walletClient = wallet;
    }
    this._checkAccount();
  }

  // subscribe the account state change
  get state$(): BehaviorSubject<AccountState> {
    return this._state$;
  }

  get stateValue(): AccountState {
    return this._state$.getValue();
  }

  /**
   * set user positions count
   */
  set position(position: string[]) {
    this._state$.next({
      ...this.stateValue,
      positon: position,
    });
  }

  set orders(orders: string[]) {
    this._state$.next({
      ...this.stateValue,
      orders,
    });
  }

  // 检查账户状态
  private async _checkAccount() {
    if (!this.walletClient) return;
    console.log("check account is esist");
    try {
      // check account is exist
      const accountInfo = await this._checkAccountExist();
      console.log(accountInfo);
      if (accountInfo && accountInfo.accountId) {
        this._state$.next({
          ...this.stateValue,
          status: "SignedIn",
          accountId: accountInfo.accountId,
          userId: accountInfo.userId,
        });
      }
      // check orderlyKey state
    } catch (err) {
      console.log("检查账户状态发现错误:", err);
    }
  }

  private async _checkAccountExist() {
    const res = await this._fetch(
      `/get_account?address=${this.walletClient?.address}&brokerId=woofi_dex`
    );

    if (res.success) {
      return res.data;
    } else {
      throw new Error(res.message);
    }
  }

  private async getAccountInfo() {}

  private async getBalance() {}

  private async _fetch(url: string) {
    const signer = getMockSigner();
    const requestUrl = `${this.configStore.get<string>("apiBaseUrl")}${url}`;
    const payload: MessageFactor = {
      method: "GET",
      url: requestUrl,
    };

    const signature = await signer.sign(payload);

    console.log(requestUrl);

    return fetch(requestUrl, {
      headers: {
        ...signature,
      },
    }).then((res) => res.json());
  }
}
