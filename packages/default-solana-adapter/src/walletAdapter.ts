import { SolanaAdapterOption, SolanaWalletProvider } from "./types";
import {
  AddOrderlyKeyInputs,
  BaseWalletAdapter, ChainNamespace, Message, RegisterAccountInputs, SettleInputs, SignatureDomain, WithdrawInputs
} from "@orderly.network/core";
import { API } from "@orderly.network/types";
import * as ed from "@noble/ed25519";
import { encode as bs58encode, decode as bs58Decode } from "bs58";
import { addOrderlyKeyMessage, registerAccountMessage } from "./helper";
import { bytesToHex } from "ethereum-cryptography/utils";

class DefaultSolanaWalletAdapter extends BaseWalletAdapter<SolanaAdapterOption> {
  chainNamespace: ChainNamespace = ChainNamespace.solana;


  private _address!: string;
  private _chainId!: number;
  private _provider!: SolanaWalletProvider;

  constructor() {
    super();
  }

  get address(): string {
    return this._address;
  }

  get chainId(): number {
    return this._chainId;
  }

  set chainId(chainId: number) {
    this._chainId = chainId;
  }

  private setConfig(config: SolanaAdapterOption) {
    this._address = config.address;
    this._chainId = config.chain.id;
    if (config.provider) {
      this._provider = config.provider;
    }
  }

  private lifecycleName(name: string, data: any) {
    console.log("lifecycle", name, data);
  }

  active(config: SolanaAdapterOption): void {
    this.setConfig(config);
    this.lifecycleName("active", config);
  }

  deactivate(): void {
    this.lifecycleName("deactivate", {});
  }

  update(config: SolanaAdapterOption): void {
    this.lifecycleName("update", config);
    this.setConfig(config);
  }

  generateSecretKey(): string {
    let privKey, secretKey;
    do {
      privKey = ed.utils.randomPrivateKey();
      secretKey = bs58encode(privKey);
    } while (secretKey.length !== 44);

    return secretKey;
  }

  async generateRegisterAccountMessage(inputs: RegisterAccountInputs): Promise<Message> {
    const [message, toSignatureMessage] = registerAccountMessage({
      ...inputs,
      chainId: this.chainId,
    });
    const signRes = await this._provider.signMessage(toSignatureMessage as Uint8Array);
    const signature = '0x' + bytesToHex(signRes);

    return {
      message: {
        ...message,
        chainType: "SOL"
      },
      signatured: signature,
    };
  }

  async generateWithdrawMessage(inputs: WithdrawInputs): Promise<Message & {domain: SignatureDomain}> {

    return {
      message: {
        chainType: "SOL"
      },
      domain: {
        name:'',
        version:'',
        chainId:902902902,
        verifyingContract:'',
      },
      signatured: "",
    };
  }

  async generateAddOrderlyKeyMessage(inputs: AddOrderlyKeyInputs): Promise<Message> {
    const [message, toSignatureMessage] = addOrderlyKeyMessage({
      ...inputs,
      chainId: this.chainId,
    });
    const res = await this._provider.signMessage(toSignatureMessage as Uint8Array);


    const signature = '0x' + bytesToHex(res);

    return {
      message: {
        ...message,
        chainType: "SOL"
      },
      signatured: signature,
    };
  }

  async generateSettleMessage(inputs: SettleInputs): Promise<Message & {domain: SignatureDomain}> {
    return {
      message: {
        chainType: "SOL"
      },
      domain: {
        name:'',
        version:'',
        chainId:902902902,
        verifyingContract:'',
      },
      signatured: ""
    };
  }

  async getBalance(): Promise<bigint> {
    return BigInt(0);
  }

  async call(address: string,
             method: string,
             params: any[],
             options?: {
               abi: any;
             }) {

  }
  
  async sendTransaction(    contractAddress: string,
                            method: string,
                            payload: {
                              from: string;
                              to?: string;
                              data: any[];
                              value?: bigint;
                            },
                            options: {
                              abi: any;
                            }) {
    
  }

  async callOnChain(
    chain: API.NetworkInfos,
    address: string,
    method: string,
    params: any[],
    options: {
      abi: any;
    }
  ): Promise<any> {
    
  }
  async pollTransactionReceiptWithBackoff(
    txHash: string,
    baseInterval?: number,
    maxInterval?: number,
    maxRetries?: number
  ): Promise<any> {
    
  }
}

export { DefaultSolanaWalletAdapter };