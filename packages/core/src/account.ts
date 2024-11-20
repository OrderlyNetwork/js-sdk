import { BaseSigner, MessageFactor } from "./signer";

import { ConfigStore } from "./configStore/configStore";
import { OrderlyKeyStore } from "./keyStore";
import {
  IWalletAdapter,
  WalletAdapterOptions,
  getWalletAdapterFunc,
} from "./wallet/adapter";
import { Signer } from "./signer";
import { AccountStatusEnum } from "@orderly.network/types";
import { SignatureDomain, getTimestamp, isHex, parseAccountId } from "./utils";

import EventEmitter from "eventemitter3";
import { BaseContract, IContract } from "./contract";
import { Assets } from "./assets";
import {
  generateAddOrderlyKeyMessage,
  generateRegisterAccountMessage,
  generateSettleMessage,
} from "./helper";
import { SDKError } from "@orderly.network/types";

export interface AccountState {
  status: AccountStatusEnum;

  // checking: boolean;

  /**
   * whether the account is validating
   */
  validating: boolean;

  accountId?: string;
  userId?: string;
  address?: string;
  /** new account */
  isNew?: boolean;

  connectWallet?: {
    name: string;
  };

  // balance: string;
  // leverage: number;
}

/**
 * Account
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

  assetsManager: Assets;

  private _state: AccountState = {
    status: AccountStatusEnum.NotConnected,
    // balance: "",
    // checking: false,
    validating: false,
    // leverage: Number.NaN,
    isNew: false,
  };

  private readonly contractManger;

  // private contract: IContract;

  walletClient?: IWalletAdapter;

  // private config =

  constructor(
    private readonly configStore: ConfigStore,
    readonly keyStore: OrderlyKeyStore,
    private readonly getWalletAdapter: getWalletAdapterFunc, // private readonly walletAdapterClass: { new (options: any): WalletAdapter } // private walletClient?: WalletClient
    options?: Partial<{
      /**
       * smart contract configuration class
       * provide contract address and abi
       */
      contracts: IContract;
    }>
  ) {
    if (options?.contracts) {
      this.contractManger = options.contracts;
    } else {
      this.contractManger = new BaseContract(configStore);
    }

    this.assetsManager = new Assets(configStore, this.contractManger, this);

    this._bindEvents();
  }

  logout() {
    // ...
  }

  async setAddress(
    address: string,
    wallet?: {
      provider: any;
      chain: { id: string | number };
      wallet?: {
        name: string;
      };
      [key: string]: any;
    }
  ): Promise<AccountStatusEnum> {
    if (!address) throw new SDKError("Address is required");
    if (!wallet?.chain?.id) throw new SDKError("Chain id is required");

    if (this.stateValue.address === address) {
      console.warn(
        "address parameter is the same as the current address, if you want to change chain, please use `switchChain` method."
      );
      return this.stateValue.status;
    }

    // if (
    //   typeof wallet?.chain?.id === "string" &&
    //   (isHex(wallet?.chain?.id) ||
    //     (wallet?.chain?.id.startsWith("0x") &&
    //       isHex(wallet?.chain?.id.slice(2))))
    // ) {
    //   wallet.chain.id = parseInt(wallet.chain.id, 16);
    // }

    wallet.chain.id = this.parseChainId(wallet?.chain?.id);

    this.keyStore.setAddress(address);

    const nextState: AccountState = {
      ...this.stateValue,
      status: AccountStatusEnum.Connected,
      address,
      accountId: undefined, // if address change, accountId should be reset
      connectWallet: wallet?.wallet,
      validating: true,
    };

    this._ee.emit("change:status", nextState);

    if (wallet) {
      // this.walletClient = new this.walletAdapterClass(wallet);
      this.walletClient = this.getWalletAdapter({
        ...wallet,
        address,
      } as WalletAdapterOptions);
    }

    return await this._checkAccount(address);
  }
  get stateValue(): AccountState {
    // return this._state$.getValue();
    return this._state;
  }

  get accountId(): string | undefined {
    const state = this.stateValue;
    return state.accountId;
  }

  get accountIdHashStr(): string | undefined {
    if (!this.address) {
      throw new Error("address is error");
    }

    // if (!this.configStore.get("brokerId")) {
    //   throw new Error("brokerId is undefined");
    // }
    const brokerId = this.configStore.get<string>("brokerId");
    return parseAccountId(this.address, brokerId);
  }

  get address(): string | undefined {
    return this.stateValue.address;
  }

  get chainId(): number | string | undefined {
    return this.walletClient?.chainId;
  }

  /**
   * set user positions count
   */
  // set position(position: string[]) {
  //   const nextState = {
  //     ...this.stateValue,
  //     positon: position,
  //   };
  //   this._ee.emit("change:status", nextState);
  // }

  // set orders(orders: string[]) {
  //   const nextState = {
  //     ...this.stateValue,
  //     orders,
  //   };
  //   this._ee.emit("change:status", nextState);
  // }

  private _bindEvents() {
    this._ee.addListener("change:status", (state: AccountState) => {
      this._state = state;
    });
  }

  // Check account status
  private async _checkAccount(address: string): Promise<AccountStatusEnum> {
    // if (!this.walletClient) return;
    //
    let nextState: AccountState;
    try {
      // check account is exist
      const accountInfo = await this._checkAccountExist(address);
      //

      if (accountInfo && accountInfo.account_id) {
        this.keyStore.setAccountId(address, accountInfo.account_id);
        // this.keyStore.setAddress(address);

        nextState = {
          ...this.stateValue,
          status: AccountStatusEnum.SignedIn,
          accountId: accountInfo.account_id,
          userId: accountInfo.user_id,
        };
        this._ee.emit("change:status", nextState);
        //
      } else {
        // account is not exist, add account
        // await this.addAccount(address);

        nextState = {
          ...this.stateValue,
          validating: false,
          status: AccountStatusEnum.NotSignedIn,
        };

        this._ee.emit("change:status", nextState);

        return AccountStatusEnum.NotSignedIn;
      }
      // check orderlyKey state
      // get orderlyKey from keyStore
      // const orderlyKey = this.keyStore.getOrderlyKey(address);
      const orderlyKey = this.keyStore.getOrderlyKey();

      // nextState = {
      //   ...this.stateValue,
      //   isNew: false,
      //   validating: false,
      //   status: AccountStatusEnum.DisabledTrading,
      // };

      if (!orderlyKey) {
        this._ee.emit("change:status", {
          ...this.stateValue,
          isNew: false,
          validating: false,
          status: AccountStatusEnum.DisabledTrading,
        });

        return AccountStatusEnum.DisabledTrading;
      }

      const publicKey = await orderlyKey.getPublicKey();

      const orderlyKeyStatus = await this._checkOrderlyKeyState(
        accountInfo.account_id,
        publicKey
      );

      //

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

        // const nextState = {
        //   ...this.stateValue,
        //   status: AccountStatusEnum.EnableTrading,
        // };

        this._ee.emit("change:status", {
          ...this.stateValue,
          validating: false,
          status: AccountStatusEnum.EnableTrading,
        });

        return AccountStatusEnum.EnableTrading;
      }

      this.keyStore.cleanKey(address, "orderlyKey");

      return AccountStatusEnum.NotConnected;
    } catch (err) {
      // return this.stateValue.status;
    }

    return AccountStatusEnum.NotSignedIn;
  }

  private async _checkAccountExist(
    address: string
  ): Promise<{ account_id: string; user_id: string } | null> {
    // const brokerId = this.configStore.get("brokerId");
    const res = await this._getAccountInfo();

    if (res.success) {
      return res.data;
    } else {
      // throw new Error(res.message);
      return null;
    }
  }

  async createAccount(): Promise<any> {
    if (!this.walletClient) {
      return Promise.reject("walletClient is undefined");
    }

    const { nonce, timestamp } = await this._getRegisterationNonce();

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    const [message, toSignatureMessage] = generateRegisterAccountMessage({
      registrationNonce: nonce,
      chainId: this.walletClient.chainId,
      brokerId: this.configStore.get("brokerId"),
      timestamp,
    });

    const signatured = await this.signTypedData(toSignatureMessage);

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
        isNew: true,
      };

      this._ee.emit("change:status", nextState);

      return res;
    }
  }

  async signTypedData(toSignatureMessage: Record<string, any>) {
    if (!this.walletClient) {
      return Promise.reject("walletClient is undefined");
    }
    return await this.walletClient.signTypedData(
      // address,
      this.stateValue.address!,
      JSON.stringify(toSignatureMessage)
    );
  }

  async createOrderlyKey(
    expiration?: number,
    scope: string = "trading,read",
    shouldMutateAppState: boolean = true
  ): Promise<any> {
    if (this.stateValue.accountId === undefined) {
      throw new Error("account id is undefined");
    }

    if (!this.walletClient) {
      throw new Error("walletClient is undefined");
    }

    const primaryType = "AddOrderlyKey";
    const keyPair = this.keyStore.generateKey();
    const publicKey = await keyPair.getPublicKey();

    const timestamp = await this._getTimestampFromServer();

    const [message, toSignatureMessage] = generateAddOrderlyKeyMessage({
      publicKey,
      chainId: this.walletClient.chainId,
      primaryType,
      expiration,
      brokerId: this.configStore.get("brokerId"),
      timestamp,
      scope,
    });

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    //
    const signatured = await this.signTypedData(toSignatureMessage);

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

    //

    if (res.success) {
      if (shouldMutateAppState) {
        this.keyStore.setKey(address, keyPair);
        const nextState = {
          ...this.stateValue,
          status: AccountStatusEnum.EnableTrading,
          // accountId: res.data.account_id,
          // userId: res.data.user_id,
        };

        this._ee.emit("change:status", nextState);
      }
      return { publicKey, secretKey: keyPair.secretKey, expiration, scope };
    } else {
      throw new Error(res.message);
    }
  }

  async settle(): Promise<any> {
    if (!this.walletClient) {
      return Promise.reject("walletClient is undefined");
    }
    const nonce = await this._getSettleNonce();
    const address = this.stateValue.address;

    const domain = this.getDomain(true);

    const url = "/v1/settle_pnl";

    const [message, toSignatureMessage] = generateSettleMessage({
      settlePnlNonce: nonce,
      chainId: this.walletClient.chainId,
      brokerId: this.configStore.get("brokerId"),
      domain,
    });

    const EIP_712signatured = await this.signTypedData(toSignatureMessage);

    const data = {
      signature: EIP_712signatured,
      message,
      userAddress: address,
      verifyingContract: domain.verifyingContract,
    };

    const payload: MessageFactor = {
      method: "POST",
      url,
      data,
    };

    //

    const signature = await this.signer.sign(payload, getTimestamp());

    const res = await this._simpleFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "orderly-account-id": this.stateValue.accountId!,

        ...signature,
      },
    });

    //

    if (res.success) {
      return Promise.resolve(res);
    } else {
      return Promise.reject(res);
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

  switchChainId(chainId: number | string) {
    chainId = this.parseChainId(chainId);
    if (this.walletClient) {
      this.walletClient.chainId = chainId as number;
    }
  }

  private parseChainId(chainId: string | number): number {
    if (
      typeof chainId === "string" &&
      (isHex(chainId) || (chainId.startsWith("0x") && isHex(chainId.slice(2))))
    ) {
      chainId = parseInt(chainId, 16);
    }
    return chainId as number;
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

    if (res.success) {
      return {
        nonce: res.data?.registration_nonce,
        timestamp: res.timestamp,
      };
    } else {
      throw new Error(res.message);
    }
  }

  private async _getTimestampFromServer() {
    const res = await this._getAccountInfo();

    if (res.success) {
      return res.timestamp;
    } else {
      throw new SDKError("get timestamp error");
    }
  }

  private async _getAccountInfo() {
    const brokerId = this.configStore.get("brokerId");
    const res = await this._simpleFetch(
      `/v1/get_account?address=${this.address}&broker_id=${brokerId}`
    );
    return res;
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

  getDomain(onChainDomain?: boolean): SignatureDomain {
    if (!this.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const chainId = this.walletClient.chainId;
    // const {verifyContractAddress} = this.contract.getContractInfoByEnv();
    return {
      name: "Orderly",
      version: "1",
      chainId,
      verifyingContract: onChainDomain
        ? this.contractManger.getContractInfoByEnv().verifyContractAddress
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
