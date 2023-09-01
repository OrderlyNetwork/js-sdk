import { BehaviorSubject } from "rxjs";
import { getMockSigner } from "./helper";
import { MessageFactor } from "./signer";

import { ConfigStore } from "./configStore";
import { OrderlyKeyStore } from "./keyStore";
import { WalletAdapter } from "./wallet/adapter";
import { Signer } from "./signer";
import { AccountStatusEnum } from "@orderly.network/types";

export type AccountStatus =
  | "NotConnected"
  | "Connected"
  | "NotSignedIn"
  | "SignedIn";

export interface AccountState {
  status: AccountStatusEnum;

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
  // private walletClient?: WalletClient;
  private _singer?: Signer;
  private _state$ = new BehaviorSubject<AccountState>({
    status: AccountStatusEnum.NotConnected,

    balance: "",
    leverage: Number.NaN,
  });

  // private config =

  constructor(
    private readonly configStore: ConfigStore,
    private readonly keyStore: OrderlyKeyStore,
    // wallet?: WalletAdapter
    private readonly walletClient: WalletAdapter // private walletClient?: WalletClient
  ) {
    // const accountId = this.keyStore.getAccountId();
    const address = this.keyStore.getAddress();
    console.log("address", address);
    if (typeof address !== "undefined") {
      // this.walletClient = new SimpleWallet(address);
      this.address = address;
    }
  }

  /**
   * 登录
   * @param address 钱包地址
   */
  login(address: string) {
    if (!address) throw new Error("address is required");

    // this.wallet = address;
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
  set address(address: string) {
    if (!address) throw new Error("address is required");

    this._state$.next({
      ...this.stateValue,
      status: AccountStatusEnum.Connected,
      address,
    });

    this._checkAccount(address);
  }

  // subscribe the account state change
  get state$(): BehaviorSubject<AccountState> {
    return this._state$;
  }

  get stateValue(): AccountState {
    return this._state$.getValue();
  }

  get accountId(): string | undefined {
    const state = this.stateValue;
    return state.accountId;
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
  private async _checkAccount(address: string) {
    // if (!this.walletClient) return;
    console.log("check account is esist");
    try {
      // check account is exist
      const accountInfo = await this._checkAccountExist(address);
      console.log(accountInfo);
      if (
        accountInfo &&
        accountInfo.account_id &&
        accountInfo.account_id !== this.stateValue.accountId
      ) {
        console.log("account next function::");
        this._state$.next({
          ...this.stateValue,
          status: AccountStatusEnum.SignedIn,
          accountId: accountInfo.account_id,
          userId: accountInfo.user_id,
        });

        this.keyStore.setAccountId(accountInfo.account_id);
        this.keyStore.setAddress(address);
      }
      // check orderlyKey state
    } catch (err) {
      console.log("检查账户状态发现错误:", err);
    }
  }

  private async _checkAccountExist(address: string) {
    const res = await this._fetch(
      `/get_account?address=${address}&broker_id=woofi_dex`
    );

    if (res.success) {
      return res.data;
    } else {
      throw new Error(res.message);
    }
  }

  get signer(): Signer {
    if (!this._singer) {
      this._singer = getMockSigner();
    }
    return this._singer;
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
