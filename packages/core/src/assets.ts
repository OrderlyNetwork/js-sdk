import { ethers } from "ethers";
import { Account } from "./account";
import { ConfigStore } from "./configStore";
import { definedTypes } from "./constants";
import { IContract } from "./contract";
import { MessageFactor } from "./signer";
import {
  SignatureDomain,
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

    // console.log("signature", signature, message, data);

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

  async getBalance(): Promise<string> {
    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();

    const result = await this.account.walletClient?.call(
      contractAddress.usdcAddress,
      "balanceOf",
      [this.account.stateValue.address],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    return this.account.walletClient?.fromUnits(result);
  }

  async getAllowance() {
    if (!this.account.walletClient) {
      return "0";
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const result = await this.account.walletClient?.call(
      contractAddress.usdcAddress,
      "allowance",
      [this.account.stateValue.address, contractAddress.vaultAddress],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    return this.account.walletClient?.fromUnits(result);
  }

  async approve(amount?: string) {
    if (!this.account.walletClient) {
      throw new Error("walletClient is undefined");
    }
    const contractAddress = this.contractManger.getContractInfoByEnv();
    const parsedAmount =
      typeof amount !== "undefined" && amount !== ""
        ? this.account.walletClient.parseUnits(amount)
        : ethers.MaxUint256.toString();

    const result = await this.account.walletClient?.call(
      contractAddress.usdcAddress,
      "approve",
      [contractAddress.vaultAddress, parsedAmount],
      {
        abi: contractAddress.usdcAbi,
      }
    );

    console.log("-----*****-----", result);

    return result;
  }

  async deposit(amount: string) {
    console.log("deposit amount:", amount);

    const brokerId = this.configStore.get<string>("brokerId");

    if (!brokerId) throw new Error("brokerId is required");

    const contractAddress = this.contractManger.getContractInfoByEnv();

    const depositData = {
      accountId: parseAccountId(this.account.stateValue.address!, brokerId!),
      brokerHash: parseBrokerHash(brokerId!),
      tokenHash: parseTokenHash("USDC"),
      tokenAmount: this.account.walletClient?.parseUnits(amount),
    };

    const result = await this.account.walletClient?.call(
      contractAddress.vaultAddress,
      "deposit",
      [depositData],
      {
        abi: contractAddress.vaultAbi,
      }
    );

    // console.log("-----*****-----", result);

    return result;
  }

  private async _simpleFetch(url: string, init: RequestInit = {}) {
    const requestUrl = `${this.configStore.get<string>("apiBaseUrl")}${url}`;

    return fetch(requestUrl, init).then((res) => res.json());
  }
}
