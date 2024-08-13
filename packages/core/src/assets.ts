import { Account } from "./account";
import { ConfigStore } from "./configStore/configStore";

import { IContract } from "./contract";
import { MessageFactor } from "./signer";
import {
  SignatureDomain,
  formatByUnits,
  getTimestamp,
  parseAccountId,
  parseBrokerHash,
  parseTokenHash,
} from "./utils";
import {
  API,
  ApiError,
  MaxUint256,
  definedTypes,
} from "@orderly.network/types";

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
    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    if (!this.account.stateValue.address)
      throw new Error("account address is rqeuired");

    const { chainId, token, allowCrossChainWithdraw } = inputs;
    let { amount } = inputs;
    if (typeof amount === "number") {
      amount = amount.toString();
    }
    const url = "/v1/withdraw_request";
    // get withdrawl nonce
    const nonce = await this.getWithdrawalNonce();
    const domain = this.account.getDomain(true);
    const [message, toSignatureMessage] = this._generateWithdrawMessage({
      chainId,
      receiver: this.account.stateValue.address!,
      token,
      amount: this.account.walletClient.parseUnits(amount),
      nonce,
      domain,
    });

    const EIP_712signatured = await this.account.signTypedData(
      toSignatureMessage
    );

    const data = {
      signature: EIP_712signatured,
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

  private _generateWithdrawMessage(inputs: {
    chainId: number;
    receiver: string;
    token: string;
    amount: string;
    nonce: number;
    domain: SignatureDomain;
  }) {
    const { chainId, receiver, token, amount, domain, nonce } = inputs;
    const primaryType = "Withdraw";
    const timestamp = Date.now();

    const typeDefinition = {
      EIP712Domain: definedTypes.EIP712Domain,
      [primaryType]: definedTypes[primaryType],
    };

    const message = {
      brokerId: this.configStore.get("brokerId"),
      chainId,
      receiver,
      token,
      amount,
      timestamp,
      withdrawNonce: nonce,
    };

    const toSignatureMessage = {
      domain,
      message,
      primaryType,
      types: typeDefinition,
    };

    return [message, toSignatureMessage];
  }

  private async getWithdrawalNonce(): Promise<number> {
    const timestamp = Date.now().toString();
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
    const result = await this.account.walletClient?.getBalance(
      this.account.stateValue.address!
    );

    // return this.account.walletClient!.formatUnits(result);
    return formatByUnits(result, options?.decimals);
  }

  async getBalance(
    address?: string,
    options?: {
      decimals?: number;
    }
  ): Promise<string> {
    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    const result = await this.account.walletClient?.call(
      address ?? contractAddress.usdcAddress,
      "balanceOf",
      [this.account.stateValue.address],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    return formatByUnits(result, options?.decimals);
    // return this.account.walletClient?.formatUnits(result,options?.decimals);
  }

  async getBalanceByAddress(
    address: string,
    options?: {
      decimals?: number;
    }
  ): Promise<string> {
    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    const result = await this.account.walletClient?.call(
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

    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletClient?.call(
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

    return this.account.walletClient?.formatUnits(result, decimals);
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

    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletClient.parseUnits(amount, decimals)
        : MaxUint256.toString();

    const result = await this.account.walletClient?.call(
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
    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletClient.parseUnits(amount, decimals)
        : MaxUint256.toString();
    const orderlyContractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletClient?.call(
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
    if (!this.account.walletClient)
      throw new Error("walletClient is undefined");

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const depositData = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash("USDC"),
      tokenAmount: this.account.walletClient?.parseUnits(amount),
    };

    const contractAddress = this.contractManger.getContractInfoByEnv();

    return await this.account.walletClient.callOnChain(
      chain,
      contractAddress.vaultAddress,
      "getDepositFee",
      [this.account.stateValue.address, depositData],
      {
        abi: contractAddress.vaultAbi,
      }
    );
  }

  async deposit(amount: string, fee: bigint = 0n) {
    if (!this.account.walletClient)
      throw new Error("walletClient is undefined");

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("[Assets]:brokerId is required");

    const contractAddress = this.contractManger.getContractInfoByEnv();

    const depositData = {
      accountId: this.account.accountIdHashStr,
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash("USDC"),
      tokenAmount: this.account.walletClient?.parseUnits(amount),
    };

    const result = await this.account.walletClient?.sendTransaction(
      contractAddress.vaultAddress,
      "deposit",
      {
        from: this.account.stateValue.address!,
        to: contractAddress.vaultAddress,
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
