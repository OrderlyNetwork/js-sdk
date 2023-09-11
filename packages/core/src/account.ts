import { BaseSigner, MessageFactor } from "./signer";

import { ConfigStore } from "./configStore";
import { OrderlyKeyStore } from "./keyStore";
import { WalletAdapter } from "./wallet/adapter";
import { Signer } from "./signer";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  SignatureDomain,
  generateAddOrderlyKeyMessage,
  generateRegisterAccountMessage,
  generateSettleMessage,
  getDomain,
} from "./utils";

import merge from "lodash.merge";

import EventEmitter from "eventemitter3";
import { BaseContract, IContract } from "./contract";

export type AccountStatus =
  | "NotConnected"
  | "Connected"
  | "NotSignedIn"
  | "SignedIn";

export interface AccountState {
  status: AccountStatusEnum;

  checking: boolean;

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
  static instanceName = "account";
  // private walletClient?: WalletClient;
  private _singer?: Signer;
  // private _state$ = new BehaviorSubject<AccountState>({
  //   status: AccountStatusEnum.NotConnected,

  //   balance: "",
  //   leverage: Number.NaN,
  // });

  private _ee = new EventEmitter();

  private _state: AccountState = {
    status: AccountStatusEnum.NotConnected,
    balance: "",
    checking: false,
    leverage: Number.NaN,
  };

  private contract: IContract;

  private walletClient?: any;

  // private config =

  constructor(
    private readonly configStore: ConfigStore,
    private readonly keyStore: OrderlyKeyStore,
    // wallet?: WalletAdapter
    private readonly walletAdapterClass: { new (options: any): WalletAdapter } // private walletClient?: WalletClient
  ) {
    this.contract = new BaseContract(configStore);

    this._bindEvents();
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

  async setAddress(
    address: string,
    wallet?: {
      provider: any;
      chain: { id: string };
      [key: string]: any;
    }
  ): Promise<AccountStatusEnum> {
    if (!address) throw new Error("address is required");

    console.log("setAddress", address, wallet);

    this.keyStore.setAddress(address);

    const nextState = {
      ...this.stateValue,
      status: AccountStatusEnum.Connected,
      address,
    };

    this._ee.emit("change:status", nextState);

    if (wallet) {
      this.walletClient = new this.walletAdapterClass(wallet);
    }

    return await this._checkAccount(address);
  }

  // subscribe the account state change
  // get state$(): BehaviorSubject<AccountState> {
  //   return this._state$;
  // }

  // public get select(): EventEmitter {
  //   return this._ee;
  // }

  get stateValue(): AccountState {
    // return this._state$.getValue();
    return this._state;
  }

  get accountId(): string | undefined {
    const state = this.stateValue;
    return state.accountId;
  }

  get address(): string | undefined {
    return this.stateValue.address;
  }

  get chainId(): string | undefined {
    return this.walletClient?.chainId;
  }

  /**
   * set user positions count
   */
  set position(position: string[]) {
    const nextState = {
      ...this.stateValue,
      positon: position,
    };
    this._ee.emit("change:status", nextState);
  }

  set orders(orders: string[]) {
    const nextState = {
      ...this.stateValue,
      orders,
    };
    this._ee.emit("change:status", nextState);
  }

  private _bindEvents() {
    this._ee.addListener("change:status", (state: AccountState) => {
      console.log("change:status", state);
      this._state = state;
    });
  }

  // 检查账户状态
  private async _checkAccount(address: string): Promise<AccountStatusEnum> {
    // if (!this.walletClient) return;
    console.log("check account is esist", address);
    let nextState;
    try {
      // check account is exist
      const accountInfo = await this._checkAccountExist(address);
      console.log("accountInfo:", accountInfo);
      // 如果切换addrees时，需要清除之前的key

      if (accountInfo && accountInfo.account_id) {
        console.log("account is exist");

        this.keyStore.setAccountId(address, accountInfo.account_id);
        // this.keyStore.setAddress(address);

        nextState = {
          ...this.stateValue,
          status: AccountStatusEnum.SignedIn,
          accountId: accountInfo.account_id,
          userId: accountInfo.user_id,
        };
        this._ee.emit("change:status", nextState);
        // console.log("account next function::");
      } else {
        // account is not exist, add account
        // await this.addAccount(address);

        nextState = {
          ...this.stateValue,
          status: AccountStatusEnum.NotSignedIn,
        };

        this._ee.emit("change:status", nextState);

        return AccountStatusEnum.NotSignedIn;
      }
      // check orderlyKey state
      // get orderlyKey from keyStore
      // const orderlyKey = this.keyStore.getOrderlyKey(address);
      const orderlyKey = this.keyStore.getOrderlyKey();

      console.log("orderlyKey:::::::", orderlyKey);

      nextState = {
        ...this.stateValue,
        status: AccountStatusEnum.DisabledTrading,
      };

      if (!orderlyKey) {
        console.log("orderlyKey is null");
        this._ee.emit("change:status", nextState);

        return AccountStatusEnum.DisabledTrading;
      }

      const publicKey = await orderlyKey.getPublicKey();

      const orderlyKeyStatus = await this._checkOrderlyKeyState(
        accountInfo.account_id,
        publicKey
      );

      console.log("orderlyKeyStatus:", orderlyKeyStatus);

      if (
        orderlyKeyStatus &&
        orderlyKeyStatus.orderly_key &&
        orderlyKeyStatus.key_status === "ACTIVE"
      ) {
        const now = Date.now();
        const expiration = orderlyKeyStatus.expiration;
        if (now > expiration) {
          // orderlyKey is expired, remove orderlyKey
          this.keyStore.cleanKey(address, "orderlyKey");
          return AccountStatusEnum.DisabledTrading;
        }

        const nextState = {
          ...this.stateValue,
          status: AccountStatusEnum.EnableTrading,
        };

        this._ee.emit("change:status", nextState);

        return AccountStatusEnum.EnableTrading;
      }

      this.keyStore.cleanKey(address, "orderlyKey");

      return AccountStatusEnum.NotConnected;
    } catch (err) {
      console.log("检查账户状态错误:", err);
      // 用户从Metamask切换账户，需要重新登录
      // return this.stateValue.status;
    }

    return AccountStatusEnum.NotSignedIn;
  }

  private async _checkAccountExist(
    address: string
  ): Promise<{ account_id: string; user_id: string } | null> {
    const res = await this._simpleFetch(
      `/v1/get_account?address=${address}&broker_id=woofi_dex`
    );

    if (res.success) {
      return res.data;
    } else {
      // throw new Error(res.message);
      return null;
    }
  }

  async createAccount(): Promise<any> {
    const nonce = await this._getRegisterationNonce();

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    const [message, toSignatureMessage] = generateRegisterAccountMessage({
      registrationNonce: nonce,
      chainId: this.walletClient.chainId,
    });

    const signatured = await this.walletClient.send("eth_signTypedData_v4", [
      address,
      JSON.stringify(toSignatureMessage),
    ]);

    const res = await this._simpleFetch("/v1/register_account", {
      method: "POST",
      body: JSON.stringify({
        signature: signatured,
        message,
        userAddress: address,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.success) {
      // this.keyStore.setKey(address, keyPair);
      this.keyStore.setAccountId(address, res.data.account_id);

      const nextState = {
        ...this.stateValue,
        status: AccountStatusEnum.DisabledTrading,
        accountId: res.data.account_id,
        userId: res.data.user_id,
      };

      this._ee.emit("change:status", nextState);

      return res;
    }
  }

  async createOrderlyKey(expiration: number): Promise<any> {
    if (this.stateValue.accountId === undefined) {
      throw new Error("account id is undefined");
    }

    if (this.walletClient === undefined) {
      throw new Error("walletClient is undefined");
    }

    const primaryType = "AddOrderlyKey";
    const keyPair = this.keyStore.generateKey();
    const publicKey = await keyPair.getPublicKey();

    const [message, toSignatureMessage] = generateAddOrderlyKeyMessage({
      publicKey,
      chainId: this.walletClient.chainId,
      primaryType,
      expiration,
    });

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    // console.log("message:", message, toSignatureMessage, address);
    const signatured = await this.walletClient.send("eth_signTypedData_v4", [
      address,
      JSON.stringify(toSignatureMessage),
    ]);

    // this.walletClient.verify(toSignatureMessage, signatured);

    const res = await this._simpleFetch("/v1/orderly_key", {
      method: "POST",
      body: JSON.stringify({
        signature: signatured,
        message,
        userAddress: address,
      }),
      headers: {
        "X-Account-Id": this.stateValue.accountId,
        "Content-Type": "application/json",
      },
    });

    // console.log("createOrderlyKey:", res);

    if (res.success) {
      this.keyStore.setKey(address, keyPair);
      const nextState = {
        ...this.stateValue,
        status: AccountStatusEnum.EnableTrading,
        // accountId: res.data.account_id,
        // userId: res.data.user_id,
      };

      this._ee.emit("change:status", nextState);

      return res;
    } else {
      throw new Error(res.message);
    }
  }

  async settlement(): Promise<any> {
    const nonce = await this._getSettleNonce();
    const address = this.stateValue.address;

    const domain = this.getDomain(true);

    console.log("domain:::::::::", domain);

    // const fullAddress = this.walletClient?.getAddresses(address);

    // console.log("fullAddress:", fullAddress);

    const [message, toSignatureMessage] = generateSettleMessage({
      settlePnlNonce: nonce,
      chainId: this.walletClient.chainId,
      domain,
    });

    const signatured = await this.walletClient.send("eth_signTypedData_v4", [
      address,
      JSON.stringify(toSignatureMessage),
    ]);

    console.log(
      "settlement:",
      address,
      message,
      toSignatureMessage,
      signatured
    );

    const publicKey = await this.keyStore.getOrderlyKey()?.getPublicKey();

    const res = await this._simpleFetch("/v1/settle_pnl", {
      method: "POST",
      body: JSON.stringify({
        signature: signatured,
        message,
        userAddress: address,
        verifyingContract: domain.verifyingContract,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-account-id": this.stateValue.accountId!,
        "orderly-key": publicKey!,
        "orderly-timestamp": (message as any).timestamp.toString(),
        "orderly-signature": signatured,
      },
    });

    // console.log("#########", res);

    if (res.success) {
      return res;
    } else {
      throw new Error(res.message);
    }
  }

  async disconnect(): Promise<void> {
    // TODO: confirm with PM, should clean all key when disconnect ?
    // if (!!this.stateValue.address) {
    //   this.keyStore.cleanAllKey(this.stateValue.address);
    // }

    const nextState = {
      ...this.stateValue,
      status: AccountStatusEnum.NotConnected,
      accountId: undefined,
      userId: undefined,
      address: undefined,
    };
    this._ee.emit("change:status", nextState);
  }

  private async _checkOrderlyKeyState(accountId: string, orderlyKey: string) {
    const res = await this._simpleFetch(
      `/v1/get_orderly_key?account_id=${accountId}&orderly_key=${orderlyKey}`
    );

    if (res.success) {
      return res.data;
    } else {
      throw new Error(res.message);
    }
  }

  get signer(): Signer {
    if (!this._singer) {
      // this._singer = getMockSigner();
      this._singer = new BaseSigner(this.keyStore);
    }
    return this._singer;
  }

  get wallet() {
    return this.walletClient;
  }

  private async _getRegisterationNonce() {
    const res = await this._simpleFetch("/v1/registration_nonce", {
      headers: {
        "orderly-account-id": this.stateValue.accountId!,
      },
    });
    console.log("getRegisterationNonce:", res);
    if (res.success) {
      return res.data?.registration_nonce;
    } else {
      throw new Error(res.message);
    }
  }

  private async _getSettleNonce() {
    const timestamp = Date.now().toString();
    const url = "/v1/settle_nonce";
    const message = [timestamp, "GET", url].join("");

    const signer = this.signer;

    const { publicKey, signature } = await signer.signText(message);

    const res = await this._simpleFetch("/v1/settle_nonce", {
      headers: {
        "orderly-account-id": this.stateValue.accountId!,
        "orderly-key": publicKey,
        "orderly-timestamp": timestamp,
        "orderly-signature": signature,
      },
    });

    if (res.success) {
      return res.data?.settle_nonce;
    } else {
      throw new Error(res.message);
    }
  }

  private async _simpleFetch(url: string, init: RequestInit = {}) {
    const requestUrl = `${this.configStore.get<string>("apiBaseUrl")}${url}`;

    return fetch(requestUrl, init).then((res) => res.json());
  }

  private getDomain(onChainDomain?: boolean): SignatureDomain {
    const chainId = this.walletClient.chainId;
    // const {verifyContractAddress} = this.contract.getContractInfoByEnv();
    return {
      name: "Orderly",
      version: "1",
      chainId,
      verifyingContract: onChainDomain
        ? this.contract.getContractInfoByEnv().verifyContractAddress
        : "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };
  }

  get on() {
    return this._ee.on.bind(this._ee);
  }
  get once() {
    return this._ee.once.bind(this._ee);
  }
  get off() {
    return this._ee.off.bind(this._ee);
  }
}
