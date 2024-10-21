import {Account} from "./account";
import {ConfigStore} from "./configStore/configStore";

import {IContract} from "./contract";
import {MessageFactor} from "./signer";
import {formatByUnits, getTimestamp, parseBrokerHash, parseTokenHash,} from "./utils";
import {API, ApiError, MaxUint256, ChainNamespace} from "@orderly.network/types";

export class Assets {
  constructor(
    private readonly configStore: ConfigStore,
    private readonly contractManger: IContract,
    private readonly account: Account
  ) {}

  async withdraw(inputs: {
    chainId: number;
    token: string;
    amount: string | number;
    allowCrossChainWithdraw: boolean;
  }) {
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
    }
    if (!this.account.stateValue.address)
      throw new Error("account address is required");

    const { chainId, token, allowCrossChainWithdraw } = inputs;
    let { amount } = inputs;
    if (typeof amount === "number") {
      amount = amount.toString();
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

    const { message, signatured, domain } =
      await this.account.walletAdapter.generateWithdrawMessage({
        // chainId,
        receiver: this.account.stateValue.address!,
        token,
        brokerId: this.configStore.get("brokerId"),
        amount: this.account.walletAdapter.parseUnits(amount),
        nonce,
        timestamp,
        // domain,
        verifyContract: this.contractManger.getContractInfoByEnv().verifyContractAddress,

      });

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

    //

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
    }
  ): Promise<string> {
    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    const result = await this.account.walletAdapter?.call(
      address ?? contractAddress.usdcAddress,
      "balanceOf",
      [this.account.stateValue.address],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    // return formatByUnits(result, options?.decimals);
    return this.account.walletAdapter?.formatUnits(result, options?.decimals);
  }

  async getBalanceByAddress(
    address: string,
    options?: {
      decimals?: number;
    }
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
      }
    );
    return formatByUnits(result, options?.decimals);
    // return this.account.walletClient?.formatUnits(result);
  }

  // async getAllowance(address?: string, vaultAddress?: string) {
  async getAllowance(
    inputs?:
      | string
      | {
          address?: string;
          vaultAddress?: string;
          decimals?: number;
        },
    _vaultAddress?: string
  ) {
    const { address, vaultAddress, decimals } =
      typeof inputs === "object"
        ? inputs
        : {
            address: inputs,
            vaultAddress: _vaultAddress,
            decimals: undefined,
          };

    if (!this.account.walletAdapter) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletAdapter?.call(
      address ?? contractAddress.usdcAddress,
      "allowance",
      [
        this.account.stateValue.address,
        vaultAddress || contractAddress.vaultAddress,
      ],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    return this.account.walletAdapter?.formatUnits(result, decimals);
    // return result;
  }

  // async approve(address?: string, amount?: string, vaultAddress?: string) {
  async approve(
    inputs?:
      | string
      | {
          address?: string;
          amount?: string;
          vaultAddress?: string;
          decimals?: number;
        },
    _amount?: string,
    _vaultAddress?: string
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
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletAdapter.parseUnits(amount, decimals)
        : MaxUint256.toString();

    const result = await this.account.walletAdapter?.call(
      // contractAddress.usdcAddress,
      address,
      "approve",
      [vaultAddress || contractAddress.vaultAddress, parsedAmount],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    return result;
  }

  async approveByAddress(inputs: {
    address: string;
    amount?: string;
    decimals?: number;
  }) {
    const { address, amount, decimals } = inputs;
    if (!this.account.walletAdapter) {
      throw new Error("walletAdapter is undefined");
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
      }
    );

    return result;
  }

  async getDepositFee(amount: string, chain: API.NetworkInfos) {
    if (!this.account.walletAdapter)
      throw new Error("walletAdapter is undefined");

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const depositData = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash("USDC"),
      tokenAmount: this.account.walletAdapter?.parseUnits(amount),
    };
    const contractAddress = this.contractManger.getContractInfoByEnv();
    let vaultAddress = contractAddress.vaultAddress;
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      vaultAddress = contractAddress.solanaVaultAddress;
      // @ts-ignore
      depositData['USDCAddress'] = contractAddress.solanaUSDCAddress
    }

    return await this.account.walletAdapter.callOnChain(
      chain,
      vaultAddress,
      "getDepositFee",
      [this.account.stateValue.address, depositData],
      {
        abi: contractAddress.vaultAbi,
      }
    );
  }

  async deposit(amount: string, fee: bigint = 0n) {
    if (!this.account.walletAdapter)
      throw new Error("walletAdapter is undefined");

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const contractAddress = this.contractManger.getContractInfoByEnv();

    const depositData = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash("USDC"),
      tokenAmount: this.account.walletAdapter?.parseUnits(amount),
    };
    let vaultAddress = contractAddress.vaultAddress;
    if (this.account.walletAdapter.chainNamespace === ChainNamespace.solana) {
      vaultAddress = contractAddress.solanaVaultAddress;
      // @ts-ignore
      depositData['USDCAddress'] = contractAddress.solanaUSDCAddress
    }
    const result = await this.account.walletAdapter?.sendTransaction(
      vaultAddress,
      "deposit",
      {
        from: this.account.stateValue.address!,
        to: vaultAddress,
        data: [depositData],
        value: fee,
      },
      {
        abi: contractAddress.vaultAbi,
      }
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
