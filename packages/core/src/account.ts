import { BaseSigner, MessageFactor, Signer } from "./signer";

import { ConfigStore } from "./configStore/configStore";
import { OrderlyKeyStore } from "./keyStore";
import {
  AccountStatusEnum,
  SDKError,
  ChainNamespace,
} from "@orderly.network/types";
import { getTimestamp, isHex, parseAccountId, parseBrokerHash } from "./utils";

import EventEmitter from "eventemitter3";
import { BaseContract, IContract } from "./contract";
import { Assets } from "./assets";
import { EVENT_NAMES } from "./constants";
import { WalletAdapterManager } from "./walletAdapterManager";
import { WalletAdapter } from "./wallet/walletAdapter";
import { BaseOrderlyKeyPair, OrderlyKeyPair } from "./keyPair";
import { PublicKey } from "@solana/web3.js";
import { AbiCoder, keccak256 } from "ethers";

export interface AccountState {
  status: AccountStatusEnum;

  // checking: boolean;

  /**
   * whether the account is validating
   */
  validating: boolean;
  /**
   * whether the account is revalidating
   */
  // revalidating?: boolean;

  accountId?: string;
  userId?: string;
  address?: string;
  chainNamespace?: ChainNamespace;
  /** new account */
  isNew?: boolean;

  connectWallet?: {
    name: string;
    chainId: number;
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

  private walletAdapterManager: WalletAdapterManager;

  assetsManager: Assets;

  private _state: AccountState = {
    status: AccountStatusEnum.NotConnected,
    // balance: "",
    // checking: false,
    validating: false, // if address exists, validating is available
    // leverage: Number.NaN,
    isNew: false,
  };

  private readonly contractManger;

  constructor(
    private readonly configStore: ConfigStore,
    readonly keyStore: OrderlyKeyStore,
    // private readonly getWalletAdapter: getWalletAdapterFunc, // private readonly walletAdapterClass: { new (options: any): WalletAdapter } // private walletClient?: WalletClient
    walletAdapters: WalletAdapter[],
    options?: Partial<{
      /**
       * smart contract configuration class
       * provide contract address and abi
       */
      contracts: IContract;
    }>
  ) {
    // this._initState();

    if (options?.contracts) {
      this.contractManger = options.contracts;
    } else {
      this.contractManger = new BaseContract(configStore);
    }

    this.assetsManager = new Assets(configStore, this.contractManger, this);
    this.walletAdapterManager = new WalletAdapterManager(walletAdapters);

    this._bindEvents();
  }

  logout() {
    // ...
  }

  async setAddress(
    address: string,
    wallet: {
      provider: any;
      chain: { id: string | number; namespace: ChainNamespace };
      wallet: {
        name: string;
      };
      [key: string]: any;
    }
  ): Promise<AccountStatusEnum> {
    if (!address) throw new SDKError("Address is required");
    if (!wallet) throw new SDKError("Wallet is required");
    if (!wallet?.chain?.id) throw new SDKError("Chain id is required");

    if (this.stateValue.address === address) {
      console.warn(
        "address parameter is the same as the current address, if you want to change chain, please use `switchChain` method."
      );
      return this.stateValue.status;
    } else {
      /// emit switch account event
      if (this.stateValue.status > AccountStatusEnum.NotConnected) {
        this._ee.emit(EVENT_NAMES.switchAccount, address);
      }
    }

    wallet.chain.id = this.parseChainId(wallet?.chain?.id);

    this.keyStore.setAddress(address);

    const nextState: AccountState = {
      ...this.stateValue,
      status: AccountStatusEnum.Connected,
      address,
      chainNamespace: wallet.chain.namespace,
      accountId: undefined, // if address change, accountId should be reset
      connectWallet: {
        // ...wallet?.wallet,
        name: wallet.wallet.name || "unknown",
        chainId: wallet.chain.id,
      },
      validating: true,
      // revalidating: this._state.validating,
    };

    this._ee.emit(EVENT_NAMES.statusChanged, nextState);

    // if (wallet) {
    //   // this.walletClient = new this.walletAdapterClass(wallet);
    //   this.walletClient = this.getWalletAdapter({
    //     ...wallet,
    //     address,
    //   } as WalletAdapterOptions);
    // }

    // console.log("------+++++++------- setAddress", this.walletAdapter, wallet);

    this.walletAdapterManager.switchWallet(
      wallet.chain.namespace,
      address,
      wallet.chain.id,
      {
        provider: wallet.provider,
        contractManager: this.contractManger,
      }
    );

    /**
     * update chainNamespace
     */
    this.configStore.set("chainNamespace", wallet.chain.namespace);

    this._ee.emit(EVENT_NAMES.validateStart);

    const finallyState = await this._checkAccount(address);

    this._ee.emit(EVENT_NAMES.validateEnd, finallyState);

    return finallyState;
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
    if (this.walletAdapter?.chainNamespace === ChainNamespace.solana) {
      const userAccount = new PublicKey(this.address);
      const decodedUserAccount = Buffer.from(userAccount.toBytes());
      const abicoder = AbiCoder.defaultAbiCoder();
      return keccak256(
        abicoder.encode(
          ["bytes32", "bytes32"],
          [decodedUserAccount, parseBrokerHash(brokerId)]
        )
      );
    }
    return parseAccountId(this.address, brokerId);
  }

  get address(): string | undefined {
    return this.stateValue.address;
  }

  get chainId(): number | string | undefined {
    // return this.walletClient?.chainId;
    if (!this.walletAdapterManager.isAdapterExist) {
      return;
    }
    return this.walletAdapterManager.chainId;
  }

  private _bindEvents() {
    this._ee.addListener(EVENT_NAMES.statusChanged, (state: AccountState) => {
      this._state = state;
    });
  }

  // Check account status
  private async _checkAccount(address: string): Promise<AccountStatusEnum> {
    // if (!this.walletClient) return;
    //
    let nextState: AccountState;
    try {
      // check account exists
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
        this._ee.emit(EVENT_NAMES.statusChanged, nextState);
        //
      } else {
        nextState = {
          ...this.stateValue,
          validating: false,
          status: AccountStatusEnum.NotSignedIn,
        };

        this._ee.emit(EVENT_NAMES.statusChanged, nextState);

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
        this._ee.emit(EVENT_NAMES.statusChanged, {
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

      if (
        orderlyKeyStatus &&
        orderlyKeyStatus.orderly_key &&
        orderlyKeyStatus.key_status === "ACTIVE"
      ) {
        const now = getTimestamp();
        const expiration = orderlyKeyStatus.expiration;
        if (now > expiration) {
          // orderlyKey is expired, remove orderlyKey
          this._ee.emit(EVENT_NAMES.statusChanged, {
            ...this.stateValue,
            validating: false,
          });
          this.keyStore.cleanKey(address, "orderlyKey");
          return AccountStatusEnum.DisabledTrading;
        }

        this._ee.emit(EVENT_NAMES.statusChanged, {
          ...this.stateValue,
          validating: false,
          status: AccountStatusEnum.EnableTrading,
        });

        return AccountStatusEnum.EnableTrading;
      }
      this._ee.emit(EVENT_NAMES.statusChanged, {
        ...this.stateValue,
        validating: false,
        // status: AccountStatusEnum.DisabledTrading,
      });

      this.keyStore.cleanKey(address, "orderlyKey");

      return AccountStatusEnum.NotConnected;
    } catch (err) {
      // return this.stateValue.status;
      this._ee.emit(EVENT_NAMES.statusChanged, {
        ...this.stateValue,
        validating: false,
        // status: AccountStatusEnum.DisabledTrading,
      });
    }

    return AccountStatusEnum.NotSignedIn;
  }

  private async _checkAccountExist(
    address: string,
    chainNamespace?: string
  ): Promise<{ account_id: string; user_id: string } | null> {
    // const brokerId = this.configStore.get("brokerId");
    const res = await this._getAccountInfo(address, chainNamespace);

    if (res.success) {
      return res.data;
    } else {
      // throw new Error(res.message);
      return null;
    }
  }

  async createAccount(): Promise<any> {
    // if (!this.walletClient) {
    //   return Promise.reject("walletClient is undefined");
    // }

    const { nonce, timestamp } = await this._getRegisterationNonce();

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    // const [message, toSignatureMessage] = generateRegisterAccountMessage({
    //   registrationNonce: nonce,
    //   chainId: this.walletClient.chainId,
    //   brokerId: this.configStore.get("brokerId"),
    //   timestamp,
    // });

    // const signatured = await this.signTypedData(toSignatureMessage);

    const { message, signatured } =
      await this.walletAdapterManager.adapter!.generateRegisterAccountMessage({
        registrationNonce: nonce,
        // chainId: this.walletClient.chainId,
        brokerId: this.configStore.get("brokerId"),
        timestamp,
      });

    // const signatured = await this.signTypedData(toSignatureMessage);

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

      this._ee.emit(EVENT_NAMES.statusChanged, nextState);

      return res;
    } else {
      throw new Error(res.message);
    }
  }

  async createApiKey(
    expiration?: number,
    options?: {
      tag?: string;
      scope?: string;
    }
  ) {
    try {
      const { res, keyPair } = await this.generateApiKey(expiration, options);
      if (res.success) {
        const key = await keyPair.getPublicKey();
        return {
          key: key.replace("ed25519:", ""),
          secretKey: keyPair.secretKey?.replace("ed25519:", ""),
        };
      }
    } catch (e) {
      console.log("createApiKey error", e);

      if (`${e}`.includes("user rejected action")) {
        throw new Error("User rejected the request.");
      }

      throw e;
    }
    throw new Error("create api key failed");
  }

  async createOrderlyKey(
    expiration?: number,
    options?: {
      tag?: string;
      scope?: string;
    }
  ): Promise<any> {
    const { res, address, keyPair } = await this.generateApiKey(
      expiration,
      options
    );

    if (res.success) {
      this.keyStore.setKey(address, keyPair);
      const nextState = {
        ...this.stateValue,
        status: AccountStatusEnum.EnableTrading,
        // accountId: res.data.account_id,
        // userId: res.data.user_id,
      };

      this._ee.emit(EVENT_NAMES.statusChanged, nextState);

      return res;
    } else {
      throw new Error(res.message);
    }
  }

  private async generateApiKey(
    expiration?: number,
    options?: {
      tag?: string;
      scope?: string;
    }
  ) {
    if (this.stateValue.accountId === undefined) {
      throw new Error("account id is undefined");
    }

    // if (!this.walletAdapterManager) {
    //   throw new Error("walletAdapterManager is undefined");
    // }

    if (!this.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (!this.walletAdapterManager.isAdapterExist) {
      throw new Error("wallet adapter is not exist");
    }

    if (typeof expiration !== "number") {
      throw new Error("the 'expiration' must be valid number");
    }

    // const primaryType = "AddOrderlyKey";
    // const keyPair = this.keyStore.generateKey();
    const secretKey = this.walletAdapter.generateSecretKey();

    const keyPair = new BaseOrderlyKeyPair(secretKey);
    const publicKey = await keyPair.getPublicKey();

    const address = this.stateValue.address;

    if (!address) {
      throw new Error("address is undefined");
    }

    const { message, signatured } =
      await this.walletAdapter.generateAddOrderlyKeyMessage({
        // chainId: number;
        brokerId: this.configStore.get("brokerId"),
        publicKey,
        expiration,
        timestamp: getTimestamp(),
        // domain: any;
        scope: options?.scope,
        tag: options?.tag,
      });

    console.log("generateAPiKey", publicKey, address);

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

    return { res, address, keyPair };
  }

  async importOrderlyKey(options: {
    secretKey: string;
    address: string;
    chainNamespace: ChainNamespace;
  }) {
    const { address, secretKey, chainNamespace } = options;
    if (!address || !secretKey || !chainNamespace) return;

    const accountInfo = await this._checkAccountExist(address, chainNamespace);
    const accountId = accountInfo?.account_id;

    if (!accountId) return;

    const orderlyKey = new BaseOrderlyKeyPair(secretKey);
    const res = await this.checkOrderlyKey(address, orderlyKey, accountId);
    if (res) {
      this.configStore.set("chainNamespace", chainNamespace);
    }
    return res;
  }

  async checkOrderlyKey(
    address: string,
    orderlyKey: OrderlyKeyPair,
    accountId: string
  ) {
    if (!address || !orderlyKey || !accountId) return;
    const publicKey = await orderlyKey.getPublicKey();

    const orderlyKeyStatus = await this._checkOrderlyKeyState(
      accountId,
      publicKey
    );

    const { orderly_key, key_status, expiration } = orderlyKeyStatus || {};
    const now = getTimestamp();

    if (orderly_key && key_status === "ACTIVE" && expiration > now) {
      this.keyStore.setAddress(address);
      this.keyStore.setKey(address, orderlyKey);
      this.keyStore.setAccountId(address, accountId);

      const nextState = {
        ...this.stateValue,
        address,
        accountId,
        // userId: accountInfo.user_id,
        status: AccountStatusEnum.EnableTradingWithoutConnected,
      };
      this._ee.emit(EVENT_NAMES.statusChanged, nextState);
      return true;
    }
  }

  async settle(): Promise<any> {
    if (!this.walletAdapter) {
      return Promise.reject("walletAdapter is undefined");
    }
    const nonce = await this._getSettleNonce();
    const address = this.stateValue.address;

    // const domain = this.getDomain(true);

    const url = "/v1/settle_pnl";

    const timestamp = getTimestamp();

    const { message, signatured, domain } =
      await this.walletAdapter.generateSettleMessage({
        settlePnlNonce: nonce,
        timestamp,
        // chainId: this.walletClient.chainId,
        brokerId: this.configStore.get("brokerId"),
        // domain,
        verifyContract:
          this.contractManger.getContractInfoByEnv().verifyContractAddress,
      });

    // const EIP_712signatured = await this.signTypedData(toSignatureMessage);

    const data = {
      signature: signatured,
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

  async destroyOrderlyKey(): Promise<void> {
    if (!!this.stateValue.address) {
      // const key = await this.keyStore.getOrderlyKey()?.getPublicKey();
      this.keyStore.cleanKey(this.stateValue.address, "orderlyKey");
    }

    const nextState = {
      ...this.stateValue,
      status: AccountStatusEnum.DisabledTrading,
    };
    this._ee.emit(EVENT_NAMES.statusChanged, nextState);
  }

  async disconnect(): Promise<void> {
    if (!!this.stateValue.address) {
      // this.keyStore.cleanAllKey(this.stateValue.address);
      this.keyStore.removeAddress();
    }

    const nextState = {
      ...this.stateValue,
      status: AccountStatusEnum.NotConnected,
      accountId: undefined,
      userId: undefined,
      address: undefined,
    };
    this._ee.emit(EVENT_NAMES.statusChanged, nextState);
  }

  switchChainId(chainId: number | string) {
    chainId = this.parseChainId(chainId);

    const nextState: AccountState = {
      ...this.stateValue,
      connectWallet: {
        // ...wallet?.wallet,
        ...this.stateValue.connectWallet!,
        chainId: chainId,
      },
      // revalidating: this._state.validating,
    };

    if (this.walletAdapter) {
      this.walletAdapter.chainId = chainId as number;
    }

    this._ee.emit(EVENT_NAMES.statusChanged, nextState);
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
      // throw new Error(res.message);
      return null;
    }
  }

  get signer(): Signer {
    if (!this._singer) {
      // this._singer = getMockSigner();
      this._singer = new BaseSigner(this.keyStore);
    }
    return this._singer;
  }

  get walletAdapter() {
    return this.walletAdapterManager.adapter;
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

  private async _getAccountInfo(address?: string, chainNamespace?: string) {
    const brokerId = this.configStore.get("brokerId");

    const addr = address || this.address;
    const chainType = chainNamespace || this.stateValue.chainNamespace;

    const res = await this._simpleFetch(
      `/v1/get_account?address=${addr}&broker_id=${brokerId}&chain_type=${chainType}`
    );
    return res;
  }

  private async _getSettleNonce() {
    const timestamp = getTimestamp().toString();
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

  // getDomain(onChainDomain?: boolean): SignatureDomain {
  //   if (!this.walletClient) {
  //     throw new Error("walletClient is undefined");
  //   }
  //   const chainId = this.walletClient.chainId;
  //   // const {verifyContractAddress} = this.contract.getContractInfoByEnv();
  //   return {
  //     name: "Orderly",
  //     version: "1",
  //     chainId,
  //     verifyingContract: onChainDomain
  //       ? this.contractManger.getContractInfoByEnv().verifyContractAddress
  //       : "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  //   };
  // }

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
