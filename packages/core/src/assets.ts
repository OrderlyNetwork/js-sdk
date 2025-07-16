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

  /**
   * Convert non-USDC asset to USDC manually
   */
  async convert(inputs: {
    slippage: number;
    amount: number;
    converted_asset: string; // must NOT be USDC
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

  async withdraw(inputs: {
    chainId: number;
    token: string;
    amount: string | number;
    allowCrossChainWithdraw: boolean;
    /** orderly withdraw decimals */
    decimals: number;
  }) {
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }
    if (!this.account.stateValue.address) {
      throw new Error("account address is required");
    }

    const { chainId, token, allowCrossChainWithdraw, decimals } = inputs;
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
      receiver: this.account.stateValue.address,
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

  async getNativeBalance(options?: {
    /** token decimals on chain, default is 18 */
    decimals?: number;
  }): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const result = await this.account.walletAdapter.getBalance();

    return this.account.walletAdapter?.formatUnits(result, options?.decimals!);
  }

  async getBalance(
    /** token address */
    address: string,
    options: {
      /** token decimals on chain, default is 18 */
      decimals?: number;
    },
  ): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractInfo = this.contractManger.getContractInfoByEnv();

    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );

    const tokenAddress = address || contractAddress.tokenAddress;

    let userAddress = this.account.stateValue.address;

    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";

    if (
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId) &&
      agwGobalAddress
    ) {
      userAddress = agwGobalAddress;
    }

    const result = await this.account.walletAdapter?.call(
      tokenAddress,
      "balanceOf",
      [userAddress],
      {
        abi: contractInfo.usdcAbi,
      },
    );

    // return formatByUnits(result, options?.decimals);
    return this.account.walletAdapter?.formatUnits(result, options?.decimals!);
  }

  /**
   * @deprecated use getBalance instead, will be removed in the future
   */
  async getBalanceByAddress(
    /** token address */
    address: string,
    options?: {
      /** token decimals on chain, default is 18 */
      decimals?: number;
    },
  ): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    const result = await this.account.walletAdapter?.call(
      address,
      "balanceOf",
      [this.account.stateValue.address],
      {
        abi: contractAddress.erc20Abi,
      },
    );
    return this.account.walletAdapter?.formatUnits?.(
      result,
      options?.decimals!,
    );
  }

  async getAllowance(inputs: {
    /** token address */
    address: string;
    /** vault address */
    vaultAddress?: string;
    /** token decimals on chain, default is 18 */
    decimals?: number;
  }) {
    const { address, vaultAddress: inputVaultAddress, decimals } = inputs;

    if (!this.account.walletAdapter) {
      return "0";
    }

    let userAddress = this.account.stateValue.address;

    const contractInfo = this.contractManger.getContractInfoByEnv();

    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );
    const vaultAddress = inputVaultAddress || contractAddress.vaultAddress;
    const tokenAddress = address || contractAddress.tokenAddress;

    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";
    if (
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId) &&
      agwGobalAddress
    ) {
      userAddress = agwGobalAddress;
    }

    console.log("get allowance", {
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
    // return result;
  }

  async approve(inputs: {
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress?: string;
    /** token amount */
    amount?: string;
    /** token decimals on chain, default is 18 */
    decimals: number;
  }) {
    const {
      address,
      amount,
      vaultAddress: inputVaultAddress,
      decimals,
    } = inputs;

    if (!address) {
      throw new Error("address is required");
    }

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletAdapter.parseUnits(amount, decimals!)
        : MaxUint256.toString();

    const contractInfo = this.contractManger.getContractInfoByEnv();

    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );

    const vaultAddress = inputVaultAddress || contractAddress.vaultAddress;
    const tokenAddress = address || contractAddress.tokenAddress;

    console.log("approve", {
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
    /** token decimals on chain, default is 18 */
    decimals: number;
  }) {
    const { address, amount, decimals } = inputs;

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const contractInfo = this.contractManger.getContractInfoByEnv();
    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );
    const vaultAddress = contractAddress.vaultAddress;

    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletAdapter.parseUnits(amount, decimals)
        : MaxUint256.toString();

    const result = await this.account.walletAdapter?.call(
      address,
      "approve",
      [vaultAddress, parsedAmount],
      {
        abi: contractInfo.erc20Abi,
      },
    );

    return result;
  }

  async getDepositFee(inputs: {
    amount: string;
    /** chain info */
    chain: API.NetworkInfos;
    /** token decimals on chain, default is 18 */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
  }) {
    const {
      amount,
      chain,
      decimals,
      token = "USDC",
      address: tokenAddress,
    } = inputs;

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const depositData: {
      accountId?: string;
      brokerHash: string;
      tokenHash: string;
      tokenAmount: string;
      USDCAddress?: string;
    } = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash(token),
      tokenAmount: this.account.walletAdapter?.parseUnits(amount, decimals!),
    };

    const userAddress = this.account.stateValue.address;

    const contractInfo = this.contractManger.getContractInfoByEnv();

    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );

    let vaultAddress = chain.vault_address;

    // TODO: get vault address from chain info
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      if (!vaultAddress) {
        vaultAddress = contractInfo.solanaVaultAddress;
      }
      depositData["USDCAddress"] =
        tokenAddress || contractInfo.solanaUSDCAddress;
    }

    if (!vaultAddress) {
      vaultAddress = contractAddress.vaultAddress;
    }

    console.log("get deposit fee", {
      userAddress,
      vaultAddress,
      depositData,
    });

    return await this.account.walletAdapter.callOnChain(
      chain,
      vaultAddress,
      "getDepositFee",
      [userAddress, depositData],
      {
        abi: contractInfo.vaultAbi,
      },
    );
  }

  /** deposit native token */
  async depositNativeToken(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain, default is 18 */
    decimals: number;
    token?: string;
  }) {
    const { amount, fee, decimals, token } = inputs;

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
    });
  }

  async deposit(inputs: {
    amount: string;
    fee: bigint;
    /** token decimals on chain, default is 18 */
    decimals: number;
    token?: string;
    /** token address */
    address?: string;
    /** vault address */
    vaultAddress?: string;
  }) {
    const {
      amount,
      fee,
      decimals,
      token = "USDC",
      address: tokenAddress,
      vaultAddress: inputVaultAddress,
    } = inputs;

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const contractInfo = this.contractManger.getContractInfoByEnv();

    const contractAddress = getContractInfoByChainId(
      this.account.walletAdapter.chainId,
      contractInfo,
    );

    const depositData: {
      accountId?: string;
      brokerHash: string;
      tokenHash: string;
      tokenAmount: string;
      USDCAddress?: string;
    } = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash(token!),
      tokenAmount: this.account.walletAdapter?.parseUnits(amount, decimals),
    };

    const userAddress = this.account.stateValue.address;
    let vaultAddress = inputVaultAddress;

    // TODO: get vault address from input params
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      if (!vaultAddress) {
        vaultAddress = contractInfo.solanaVaultAddress;
      }
      depositData["USDCAddress"] =
        tokenAddress || contractInfo.solanaUSDCAddress;
    }

    if (!vaultAddress) {
      vaultAddress = contractAddress.vaultAddress;
    }

    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";

    let contractMethod = "deposit";
    let fromAddress = userAddress;
    let contractData: any = [depositData];

    if (
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId) &&
      agwGobalAddress
    ) {
      console.log(
        "agw address",
        agwGobalAddress,
        this.account.walletAdapter.chainId,
      );
      contractMethod = "depositTo";
      fromAddress = agwGobalAddress;
      contractData = [userAddress, depositData];
    }
    console.log("xxx deposit", {
      vaultAddress,
      fromAddress,
      contractMethod,
      contractData,
      fee,
    });

    const result = await this.account.walletAdapter?.sendTransaction(
      vaultAddress,
      contractMethod,
      {
        from: fromAddress!,
        to: vaultAddress,
        data: contractData,
        value: fee,
      },
      {
        abi: contractInfo.vaultAbi,
      },
    );
    return result;
  }

  private async _simpleFetch(url: string, init: RequestInit = {}) {
    const requestUrl = `${this.configStore.get<string>("apiBaseUrl")}${url}`;

    return fetch(requestUrl, init).then((res) => res.json());
  }

  get usdcAddress() {
    return this.contractManger.getContractInfoByEnv().usdcAddress;
  }
}
