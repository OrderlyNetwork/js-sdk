import {
  ABSTRACT_CHAIN_ID_MAP,
  API,
  ApiError,
  BSC_TESTNET_CHAINID,
  ChainNamespace,
  MaxUint256,
  MONAD_TESTNET_CHAINID,
  STORY_TESTNET_CHAINID,
} from "@orderly.network/types";
import { Account } from "./account";
import { ConfigStore } from "./configStore/configStore";
import { IContract } from "./contract";
import { MessageFactor } from "./signer";
import {
  formatByUnits,
  getTimestamp,
  parseBrokerHash,
  parseTokenHash,
} from "./utils";

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

  async getNativeBalance(options?: { decimals?: number }): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const result = await this.account.walletAdapter.getBalance();

    // return this.account.walletClient!.formatUnits(result);
    return formatByUnits(result, options?.decimals);
  }

  async getBalance(
    address?: string,
    options?: {
      decimals?: number;
    },
  ): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    let usdcAddress = address ?? contractAddress.usdcAddress;
    let userAddress = this.account.stateValue.address;
    if (ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId)) {
      usdcAddress = contractAddress.abstractUSDCAddress ?? "";
    }
    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";
    if (
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId) &&
      agwGobalAddress
    ) {
      userAddress = agwGobalAddress;
    }
    const result = await this.account.walletAdapter?.call(
      usdcAddress,
      "balanceOf",
      [userAddress],
      {
        abi: contractAddress.usdcAbi,
      },
    );

    // return formatByUnits(result, options?.decimals);
    return this.account.walletAdapter?.formatUnits(result, options?.decimals!);
  }

  async getBalanceByAddress(
    address: string,
    options?: {
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
    return formatByUnits(result, options?.decimals);
    // return this.account.walletClient?.formatUnits(result);
  }

  // async getAllowance(address?: string, vaultAddress?: string) {
  async getAllowance(
    /** please use object inputs instead, string inputs will be removed in the future */
    inputs?:
      | string
      | {
          address?: string;
          vaultAddress?: string;
          decimals?: number;
        },
    /** @deprecated use inputs.vaultAddress instead, will be removed in the future */
    _vaultAddress?: string,
  ) {
    const { address, vaultAddress, decimals } =
      typeof inputs === "object"
        ? inputs
        : { address: inputs, vaultAddress: _vaultAddress };

    if (!this.account.walletAdapter) {
      return "0";
    }

    let userAddress = this.account.stateValue.address;
    const contractAddress = this.contractManger.getContractInfoByEnv();
    let tempVaultAddress = vaultAddress ?? contractAddress.vaultAddress;
    let tempUSDCAddress = address;
    if (this.account.walletAdapter.chainId === STORY_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.storyTestnetVaultAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === MONAD_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.monadTestnetVaultAddress ?? "";
      tempUSDCAddress = contractAddress.monadTestnetUSDCAddress;
    }
    if (ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId)) {
      tempVaultAddress = contractAddress.abstractVaultAddress ?? "";
      tempUSDCAddress = contractAddress.abstractUSDCAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === BSC_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.bscVaultAddress ?? "";
      tempUSDCAddress = contractAddress.bscUSDCAddress ?? "";
    }
    const agwGobalAddress = this.account.getAdditionalInfo()?.AGWAddress ?? "";
    if (
      ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId) &&
      agwGobalAddress
    ) {
      userAddress = agwGobalAddress;
    }

    // console.log("get allowance", {
    //   tempUSDCAddress,
    //   tempVaultAddress,
    //   userAddress,
    // });

    const result = await this.account.walletAdapter?.call(
      tempUSDCAddress ?? "",
      "allowance",
      [userAddress, tempVaultAddress],
      {
        abi: contractAddress.usdcAbi,
      },
    );

    return this.account.walletAdapter?.formatUnits(result, decimals!);
    // return result;
  }

  async approve(
    /** please use object inputs instead, string inputs will be removed in the future */
    inputs:
      | string
      | {
          address?: string;
          amount?: string;
          vaultAddress?: string;
          decimals: number;
        },
    /** @deprecated use inputs.amount instead, will be removed in the future */
    _amount?: string,
    /** @deprecated use inputs.vaultAddress instead, will be removed in the future */
    _vaultAddress?: string,
  ) {
    const { address, amount, vaultAddress, decimals } =
      typeof inputs === "object"
        ? inputs
        : {
            address: inputs,
            amount: _amount,
            vaultAddress: _vaultAddress,
            decimals: undefined,
          };

    if (!address) {
      throw new Error("address is required");
    }

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const contractAddress = this.contractManger.getContractInfoByEnv();
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletAdapter.parseUnits(amount, decimals!)
        : MaxUint256.toString();

    let tempVaultAddress = vaultAddress || contractAddress.vaultAddress;
    let tempUSDCAddress = address;
    if (this.account.walletAdapter.chainId === STORY_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.storyTestnetVaultAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === MONAD_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.monadTestnetVaultAddress ?? "";
      tempUSDCAddress = contractAddress.monadTestnetUSDCAddress ?? "";
    }
    if (ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId)) {
      tempVaultAddress = contractAddress.abstractVaultAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === BSC_TESTNET_CHAINID) {
      tempVaultAddress = contractAddress.bscVaultAddress ?? "";
      tempUSDCAddress = contractAddress.bscUSDCAddress ?? "";
    }
    // console.log("xxx approve", {
    //   tempVaultAddress,
    //   tempUSDCAddress,
    //   parsedAmount,
    // });

    const result = await this.account.walletAdapter?.call(
      tempUSDCAddress,
      "approve",
      [tempVaultAddress, parsedAmount],
      {
        abi: contractAddress.usdcAbi,
      },
    );
    return result;
  }

  async approveByAddress(inputs: {
    address: string;
    amount?: string;
    decimals: number;
  }) {
    const { address, amount, decimals } = inputs;

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletAdapter.parseUnits(amount, decimals)
        : MaxUint256.toString();
    const orderlyContractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletAdapter?.call(
      address,
      "approve",
      [orderlyContractAddress.vaultAddress, parsedAmount],
      {
        abi: orderlyContractAddress.erc20Abi,
      },
    );

    return result;
  }

  async getDepositFee(
    /** please use object inputs instead, string inputs will be removed in the future */
    inputs:
      | string
      | {
          amount: string;
          chain: API.NetworkInfos;
          decimals: number;
          token?: string;
        },
    /** @deprecated use inputs.chain instead, will be removed in the future */
    _chain?: API.NetworkInfos,
  ) {
    const {
      amount,
      chain,
      decimals,
      token = "USDC",
    } = typeof inputs === "object"
      ? inputs
      : { amount: inputs, chain: _chain! };

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
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const userAddress = this.account.stateValue.address;
    let vaultAddress = contractAddress.vaultAddress;
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      vaultAddress = contractAddress.solanaVaultAddress;
      // @ts-ignore
      depositData["USDCAddress"] = contractAddress.solanaUSDCAddress;
    }
    if (chain.chain_id === STORY_TESTNET_CHAINID) {
      vaultAddress = contractAddress.storyTestnetVaultAddress ?? "";
    }
    if (chain.chain_id === MONAD_TESTNET_CHAINID) {
      vaultAddress = contractAddress.monadTestnetVaultAddress ?? "";
      // depositData["USDCAddress"] = contractAddress.monadTestnetUSDCAddress ?? "";
    }
    if (chain.chain_id === BSC_TESTNET_CHAINID) {
      vaultAddress = contractAddress.bscVaultAddress ?? "";
    }
    if (ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId)) {
      vaultAddress = contractAddress.abstractVaultAddress ?? "";
    }

    // console.log("get deposit fee", {
    //   userAddress,
    //   vaultAddress,
    //   depositData,
    // });

    return await this.account.walletAdapter.callOnChain(
      chain,
      vaultAddress,
      "getDepositFee",
      [userAddress, depositData],
      {
        abi: contractAddress.vaultAbi,
      },
    );
  }

  async deposit(
    /** please use object inputs instead */
    inputs:
      | string
      | {
          amount: string;
          fee: bigint;
          decimals: number;
          token?: string;
        },
    /** @deprecated use inputs.fee instead, will be removed in the future */
    _fee?: bigint,
  ) {
    const {
      amount,
      fee = 0n,
      decimals,
      token = "USDC",
    } = typeof inputs === "object" ? inputs : { amount: inputs, fee: _fee };

    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }

    if (decimals === undefined || decimals === null) {
      throw new Error("decimals is required");
    }

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const contractAddress = this.contractManger.getContractInfoByEnv();

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

    let vaultAddress = contractAddress.vaultAddress;
    const userAddress = this.account.stateValue.address;
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      vaultAddress = contractAddress.solanaVaultAddress;
      // @ts-ignore
      depositData["USDCAddress"] = contractAddress.solanaUSDCAddress;
    }
    if (this.account.walletAdapter.chainId === STORY_TESTNET_CHAINID) {
      vaultAddress = contractAddress.storyTestnetVaultAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === MONAD_TESTNET_CHAINID) {
      vaultAddress = contractAddress.monadTestnetVaultAddress ?? "";
    }
    if (ABSTRACT_CHAIN_ID_MAP.has(this.account.walletAdapter.chainId)) {
      vaultAddress = contractAddress.abstractVaultAddress ?? "";
    }
    if (this.account.walletAdapter.chainId === BSC_TESTNET_CHAINID) {
      vaultAddress = contractAddress.bscVaultAddress ?? "";
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
        abi: contractAddress.vaultAbi,
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
