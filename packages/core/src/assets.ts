import {
  ABSTRACT_CHAIN_ID_MAP,
  API,
  ApiError,
  ChainNamespace,
  MaxUint256,
} from "@orderly.network/types";
import { Account } from "./account";
import { ConfigStore } from "./configStore/configStore";
import { getContractInfoByChainId, IContract } from "./contract";
import { MessageFactor } from "./signer";
import { getTimestamp, parseBrokerHash, parseTokenHash } from "./utils";

export class Assets {
  constructor(
    private readonly configStore: ConfigStore,
    private readonly contractManger: IContract,
    private readonly account: Account,
  ) {}

  async getBalance(
    /** token address */
    address: string,
    options: {
      /** token decimals on chain */
      decimals?: number;
    },
  ): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractInfo = this.contractManger.getContractInfoByEnv();

    const tokenAddress = address;

    const userAddress = this.isAbstract()
      ? this.getAgwGlobalAddress()
      : this.account.stateValue.address;

    const result = await this.account.walletAdapter?.call(
      tokenAddress,
      "balanceOf",
      [userAddress],
      {
        abi: contractInfo.usdcAbi,
      },
    );

    return this.account.walletAdapter?.formatUnits(result, options?.decimals!);
  }

  async getNativeBalance(options?: {
    /** token decimals on chain */
    decimals?: number;
  }): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const result = await this.account.walletAdapter.getBalance();

    return this.account.walletAdapter?.formatUnits(result, options?.decimals!);
  }

  /**
   * @deprecated use getBalance instead, will be removed in the future
   */
  async getBalanceByAddress(
    address: string,
    options?: {
      decimals?: number;
    },
  ): Promise<string> {
    return this.getBalance(address, options!);
  }

  async getBalances(tokens: API.TokenInfo[]) {
    if (!this.account.walletAdapter) {
      return {};
    }
    const addresses = tokens.map((token) => token.address!);
    const result = await this.account.walletAdapter.getBalances(addresses);

    const balances = {} as Record<string, string>;

    result.forEach((item: string, index: number) => {
      const { symbol, decimals } = tokens[index];
      const balance = this.account.walletAdapter?.formatUnits(item, decimals!);
      balances[symbol!] = balance!;
    });
    return balances;
  }

  async getAllowance(inputs: {
    /** token address */
    address: string;
    /** vault address */
    vaultAddress?: string;
    /** token decimals on chain */
    decimals?: number;
  }) {
    const { address: tokenAddress, vaultAddress, decimals } = inputs;

    if (!this.account.walletAdapter) {
      return "0";
    }

    const userAddress = this.isAbstract()
      ? this.getAgwGlobalAddress()
      : this.account.stateValue.address;

    const contractInfo = this.contractManger.getContractInfoByEnv();

    console.info("get allowance", {
      tokenAddress,
      vaultAddress,
      userAddress,
    });

    const result = await this.account.walletAdapter?.call(
      tokenAddress,
      "allowance",
      [userAddress, vaultAddress],
      {
        abi: contractInfo.usdcAbi,
      },
    );

    return this.account.walletAdapter?.formatUnits(result, decimals!);
  }

  async approve(inputs: {
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress?: string;
    /** token decimals on chain */
    decimals: number;
    /** token amount */
    amount?: string;
    isSetMaxValue?: boolean;
  }) {
    const {
      address: tokenAddress,
      amount,
      vaultAddress,
      decimals,
      isSetMaxValue,
    } = inputs;

    if (!tokenAddress) {
      throw new Error("address is required");
    }

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    let parsedAmount = MaxUint256.toString();
    if (!isSetMaxValue) {
      parsedAmount =
        typeof amount !== "undefined" && amount !== ""
          ? this.account.walletAdapter.parseUnits(amount, decimals!)
          : MaxUint256.toString();
    }

    const contractInfo = this.contractManger.getContractInfoByEnv();

    console.info("approve", {
      vaultAddress,
      tokenAddress,
      parsedAmount,
    });

    const result = await this.account.walletAdapter?.call(
      tokenAddress,
      "approve",
      [vaultAddress, parsedAmount],
      {
        abi: contractInfo.usdcAbi,
      },
    );
    return result;
  }

  /**
   * @deprecated use approve instead, will be removed in the future
   */
  async approveByAddress(inputs: {
    /** token address */
    address: string;
    /** token amount */
    amount?: string;
    /** token decimals on chain */
    decimals: number;
  }) {
    const { address, amount, decimals } = inputs;

    const contractInfo = this.contractManger.getContractInfoByEnv();
    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter?.chainId!,
      contractInfo,
    );

    return this.approve({
      address,
      amount,
      vaultAddress: contractAddress.vaultAddress,
      decimals,
    });
  }

  async getDepositFee(inputs: {
    amount: string;
    /** chain info */
    chain: API.NetworkInfos;
    /** token decimals on chain */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
  }) {
    const { chain } = inputs;
    const { userAddress, depositData, abi } = await this.getDepositData(inputs);
    const vaultAddress = chain.vault_address;

    return await this.account.walletAdapter!.callOnChain(
      chain,
      vaultAddress,
      "getDepositFee",
      [userAddress, depositData],
      { abi },
    );
  }

  async estimateDepositGasFee(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress: string;
  }) {
    const { vaultAddress, fee } = inputs;
    const { contractMethod, fromAddress, contractData, abi } =
      await this.getDepositData(inputs);

    const gasFee = await this.account.walletAdapter!.estimateGasFee!(
      vaultAddress,
      contractMethod,
      {
        from: fromAddress!,
        to: vaultAddress,
        data: contractData,
        value: fee,
      },
      { abi },
    );
    console.info("gasFee", gasFee);
    return gasFee;
  }

  async estimateNativeDepositGasFee(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress: string;
  }) {
    const { vaultAddress, fee, amount, decimals, token, address } = inputs;

    const tokenAmount = this.account.walletAdapter?.parseUnits(
      amount,
      decimals,
    );

    // if native token, fee is amount + depositFee
    const value = BigInt(tokenAmount!) + fee;

    return this.estimateDepositGasFee({
      amount,
      fee: value,
      decimals,
      token,
      address,
      vaultAddress,
    });
  }

  async getDepositData(inputs: {
    amount: string;
    /** token decimals on chain */
    decimals: number;
    /** token symbol */
    token?: string;
    /** token address */
    address?: string;
  }) {
    const { amount, decimals, token = "USDC", address: tokenAddress } = inputs;

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) {
      throw new Error("[Assets]:brokerId is required");
    }

    const contractInfo = this.contractManger.getContractInfoByEnv();

    const depositData: {
      accountId?: string;
      brokerHash: string;
      tokenHash: string;
      tokenAmount: string;
      tokenAddress?: string;
    } = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash(token!),
      tokenAmount: this.account.walletAdapter?.parseUnits(amount, decimals),
    };

    if (this.isSolana()) {
      depositData["tokenAddress"] = tokenAddress;
    }

    const userAddress = this.account.stateValue.address;

    let contractMethod = "deposit";
    let fromAddress = userAddress;
    let contractData: any[] = [depositData];

    if (this.isAbstract()) {
      contractMethod = "depositTo";
      fromAddress = this.getAgwGlobalAddress();
      contractData = [userAddress, depositData];
    }

    console.info("deposit data", {
      fromAddress,
      contractMethod,
      contractData,
    });

    return {
      contractMethod,
      userAddress,
      fromAddress,
      depositData,
      contractData,
      abi: contractInfo.vaultAbi,
    };
  }

  async deposit(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress: string;
  }) {
    const { fee, vaultAddress } = inputs;
    const { contractMethod, fromAddress, contractData, abi } =
      await this.getDepositData(inputs);

    const result = await this.account.walletAdapter?.sendTransaction(
      vaultAddress,
      contractMethod,
      {
        from: fromAddress!,
        to: vaultAddress,
        data: contractData,
        value: fee,
      },
      { abi },
    );

    return result;
  }

  /** deposit native token */
  async depositNativeToken(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain */
    decimals: number;
    token?: string;
    vaultAddress: string;
  }) {
    const { amount, fee, decimals, token, vaultAddress } = inputs;

    const tokenAmount = this.account.walletAdapter?.parseUnits(
      amount,
      decimals,
    );

    // if native token, fee is amount + depositFee
    const value = BigInt(tokenAmount!) + fee;

    return this.deposit({
      amount,
      fee: value,
      decimals,
      token,
      vaultAddress,
    });
  }

  async withdraw(inputs: {
    chainId: number;
    token: string;
    amount: string | number;
    /** orderly withdraw decimals, not chain decimals */
    decimals: number;
    receiver?: string;
    allowCrossChainWithdraw: boolean;
  }) {
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }
    if (!this.account.stateValue.address) {
      throw new Error("account address is required");
    }

    const { chainId, token, allowCrossChainWithdraw, decimals, receiver } =
      inputs;
    let { amount } = inputs;
    if (typeof amount === "number") {
      amount = amount.toString();
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const url = "/v1/withdraw_request";
    // get withdrawal nonce
    const nonce = await this.getWithdrawalNonce();
    const timestamp = getTimestamp();
    // const domain = this.account.getDomain(true);
    // const [message, toSignatureMessage] = this._generateWithdrawMessage({
    //   chainId,
    //   receiver: this.account.stateValue.address!,
    //   token,
    //   amount: this.account.walletClient.parseUnits(amount),
    //   nonce,
    //   domain,
    // });

    // const EIP_712signatured = await this.account.signTypedData(
    //   toSignatureMessage
    // );
    const messageData = {
      receiver: receiver || this.account.stateValue.address,
      token,
      brokerId: this.configStore.get("brokerId"),
      amount: this.account.walletAdapter.parseUnits(amount, decimals),
      nonce,
      timestamp,
      // domain,
      verifyContract:
        this.contractManger.getContractInfoByEnv().verifyContractAddress,
    };

    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";

    if (ABSTRACT_CHAIN_ID_MAP.has(chainId) && agwGobalAddress) {
      messageData.receiver = agwGobalAddress;
    }

    const { message, signatured, domain } =
      await this.account.walletAdapter.generateWithdrawMessage(messageData);

    const data = {
      signature: signatured,
      message,
      userAddress: this.account.stateValue.address,
      verifyingContract: domain.verifyingContract,
    };

    const payload: MessageFactor = {
      method: "POST",
      url,
      data,
    };

    if (allowCrossChainWithdraw) {
      // @ts-ignore
      data.message = {
        ...data.message,
        // @ts-ignore
        allowCrossChainWithdraw: allowCrossChainWithdraw,
      };
    }

    const signature = await this.account.signer.sign(payload, getTimestamp());

    const res = await this._simpleFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "orderly-account-id": this.account.stateValue.accountId!,

        ...signature,
      },
    });

    if (!res.success) {
      throw new ApiError(res.message, res.code);
    }

    return res;
  }

  private async getWithdrawalNonce(): Promise<number> {
    const timestamp = getTimestamp().toString();
    const url = "/v1/withdraw_nonce";
    const message = [timestamp, "GET", url].join("");

    const signer = this.account.signer;

    const { publicKey, signature } = await signer.signText(message);

    const res = await this._simpleFetch(url, {
      headers: {
        "orderly-account-id": this.account.stateValue.accountId!,
        "orderly-key": publicKey,
        "orderly-timestamp": timestamp,
        "orderly-signature": signature,
      },
    });

    if (res.success) {
      return res.data?.withdraw_nonce;
    } else {
      throw new Error(res.message);
    }
  }

  async internalTransfer(inputs: {
    token: string;
    amount: string;
    receiver: string;
    /** orderly token decimals */
    decimals: number;
  }) {
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    const { token, amount, receiver, decimals } = inputs;

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const url = "/v2/internal_transfer";
    const nonce = await this.getTransferNonce();
    const messageData = {
      receiver,
      token,
      amount: this.account.walletAdapter.parseUnits(amount, decimals),
      nonce,
      verifyContract:
        this.contractManger.getContractInfoByEnv().verifyContractAddress,
    };

    const { message, signatured, domain } =
      await this.account.walletAdapter.generateInternalTransferMessage(
        messageData,
      );

    const data = {
      signature: signatured,
      message,
      userAddress: this.account.stateValue.address,
      verifyingContract: domain.verifyingContract,
    };

    const payload: MessageFactor = {
      method: "POST",
      url,
      data,
    };

    const signature = await this.account.signer.sign(payload, getTimestamp());

    const res = await this._simpleFetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "orderly-account-id": this.account.stateValue.accountId!,
        ...signature,
      },
    });

    if (!res.success) {
      throw new ApiError(res.message, res.code);
    }

    return res;
  }

  /**
   * Convert non-USDC asset to USDC manually
   */
  async convert(inputs: {
    slippage: number;
    amount: number;
    /** must NOT be USDC */
    converted_asset: string;
  }) {
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }
    if (!this.account.stateValue.address) {
      throw new Error("account address is required");
    }

    const { slippage, amount, converted_asset } = inputs;

    if (!converted_asset || converted_asset.toUpperCase() === "USDC") {
      throw new Error("converted_asset cannot be USDC");
    }

    const payload = {
      slippage,
      amount,
      converted_asset,
    };

    const url = "/v1/asset/manual_convert";

    const timestamp = getTimestamp().toString();
    const message = [timestamp, "POST", url, JSON.stringify(payload)].join("");
    const signer = this.account.signer;
    const { publicKey, signature } = await signer.signText(message);

    const res = await this._simpleFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "orderly-account-id": this.account.stateValue.accountId!,
        "orderly-key": publicKey,
        "orderly-timestamp": timestamp,
        "orderly-signature": signature,
      },
      body: JSON.stringify(payload),
    });

    if (!res.success) {
      throw new ApiError(res.message, res.code);
    }

    return res;
  }

  private async getTransferNonce(): Promise<number> {
    const timestamp = getTimestamp().toString();
    const url = "/v1/transfer_nonce";
    const message = [timestamp, "GET", url].join("");

    const signer = this.account.signer;

    const { publicKey, signature } = await signer.signText(message);

    const res = await this._simpleFetch(url, {
      headers: {
        "orderly-account-id": this.account.stateValue.accountId!,
        "orderly-key": publicKey,
        "orderly-timestamp": timestamp,
        "orderly-signature": signature,
      },
    });

    if (res.success) {
      return res.data?.transfer_nonce;
    } else {
      throw new Error(res.message);
    }
  }

  private async _simpleFetch(url: string, init: RequestInit = {}) {
    const requestUrl = `${this.configStore.get<string>("apiBaseUrl")}${url}`;

    return fetch(requestUrl, init).then((res) => res.json());
  }

  get usdcAddress() {
    return this.contractManger.getContractInfoByEnv().usdcAddress;
  }

  private isSolana() {
    return this.account.walletAdapter?.chainNamespace === ChainNamespace.solana;
  }

  private isAbstract() {
    const agwGobalAddress = this.getAgwGlobalAddress();

    return (
      agwGobalAddress &&
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter?.chainId!)
    );
  }

  private getAgwGlobalAddress() {
    return this.account.getAdditionalInfo()?.AGWAddress ?? "";
  }
}
