import { ethers } from "ethers";
import { Account } from "./account";
import { ConfigStore } from "./configStore/configStore";
import { definedTypes } from "./constants";
import { IContract } from "./contract";
import { MessageFactor } from "./signer";
import {
  SignatureDomain,
  formatByUnits,
  parseAccountId,
  parseBrokerHash,
  parseTokenHash,
} from "./utils";

export class Assets {
  constructor(
    private readonly configStore: ConfigStore,
    private readonly contractManger: IContract,
    private readonly account: Account
  ) {}

  async withdraw(inputs: { chainId: number; token: string; amount: number }) {
    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    if (!this.account.stateValue.address)
      throw new Error("account address is rqeuired");

    const { chainId, token, amount } = inputs;
    const url = "/v1/withdraw_request";
    // get withdrawl nonce
    const nonce = await this.getWithdrawalNonce();
    const domain = this.account.getDomain(true);
    const [message, toSignatureMessage] = this._generateWithdrawMessage({
      chainId,
      receiver: this.account.stateValue.address!,
      token,
      amount: this.account.walletClient.parseUnits(amount.toString()),
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

    const signature = await this.account.signer.sign(payload);

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

  async getBalanceByAddress(address: string): Promise<string> {
    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    //

    const result = await this.account.walletClient?.call(
      address,
      "balanceOf",
      [this.account.stateValue.address],
      {
        abi: contractAddress.erc20Abi,
      }
    );

    return this.account.walletClient?.formatUnits(result);
  }

  async getAllowance(address?: string, vaultAddress?: string) {
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

    return this.account.walletClient?.formatUnits(result);
  }

  async approve(address?: string, amount?: string, vaultAddress?: string) {
    if (!address) {
      throw new Error("address is required");
    }

    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletClient.parseUnits(amount)
        : ethers.MaxUint256.toString();

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

  async approveByAddress(inputs: { amount?: string; address: string }) {
    const { amount, address } = inputs;

    return this._approve(address, amount);
  }

  private async _approve(contractAddress: string, amount?: string) {
    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletClient.parseUnits(amount)
        : ethers.MaxUint256.toString();
    const orderlyContractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletClient?.call(
      contractAddress,
      "approve",
      [orderlyContractAddress.vaultAddress, parsedAmount],
      {
        abi: orderlyContractAddress.erc20Abi,
      }
    );

    return result;
  }

  async deposit(amount: string) {
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

    // --- call deposit
    // const result = await this.account.walletClient?.call(
    //   contractAddress.vaultAddress,
    //   "deposit",
    //   [depositData],
    //   {
    //     abi: contractAddress.vaultAbi,
    //   }
    // );

    const result = await this.account.walletClient?.sendTransaction(
      contractAddress.vaultAddress,
      "deposit",
      {
        from: this.account.stateValue.address!,
        to: contractAddress.vaultAddress,
        data: [depositData],
        value: 0n,
      },
      {
        abi: contractAddress.vaultAbi,
      }
    );

    //

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
