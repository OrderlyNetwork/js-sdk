import { SolanaAdapterOption, SolanaWalletProvider } from "./types";
import {
  AddOrderlyKeyInputs,
  BaseWalletAdapter, Message, RegisterAccountInputs, SettleInputs, SignatureDomain, WithdrawInputs
} from "@orderly.network/core";
import {API, MaxUint256, ChainNamespace} from "@orderly.network/types";
import * as ed from "@noble/ed25519";
import { encode as bs58encode, decode as bs58Decode } from "bs58";
import {
  addOrderlyKeyMessage, deposit,
  encodeLzMessage, getDepositQuoteFee,
  MsgType,
  registerAccountMessage,
  settleMessage,
  withdrawMessage
} from "./helper";
import { bytesToHex } from "ethereum-cryptography/utils";
import { getAccount } from "@solana/spl-token";
import {
  getBrokerPDA,
  getDefaultSendConfigPda,
  getDefaultSendLibConfigPda,
  getDvnConfigPda,
  getEndorcedOptionsPda,
  getEndpointSettingPda,
  getEventAuthorityPda,
  getExecutorConfigPda,
  getLookupTableAccount,
  getLookupTableAddress,
  getMessageLibInfoPda,
  getMessageLibPda,
  getNoncePda,
  getOAppConfigPda, getPeerAddress,
  getPeerPda,
  getPriceFeedPda,
  getSendConfigPda,
  getSendLibConfigPda,
  getSendLibInfoPda,
  getSendLibPda,
  getTokenPDA,
  getUlnEventAuthorityPda,
  getUlnSettingPda,
  getUSDCAccounts,
  getVaultAuthorityPda
} from "./solana.util";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import {BN, Program} from "@coral-xyz/anchor";
import {SolanaVault,  IDL as VaultIDL} from "./idl/solana_vault";
import {
  DST_EID, DVN_PROGRAM_ID,
  ENDPOINT_PROGRAM_ID,
  EXECUTOR_PROGRAM_ID,
  PRICE_FEED_PROGRAM_ID,
  SEND_LIB_PROGRAM_ID,
  TREASURY_PROGRAM_ID
} from "./constant";

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
    const [message, toSignatureMessage] =withdrawMessage({
      ...inputs,
      chainId: this.chainId,
    });
    const signRes = await this._provider.signMessage(toSignatureMessage as Uint8Array);
    const signature = '0x' + bytesToHex(signRes);
    console.log('-- verify contract', inputs.verifyContract);



    return {
      message: {
        ...message,
        chainType: "SOL"
      },
      domain: {
        name:'',
        version:'',
        chainId:this.chainId,
        verifyingContract:inputs.verifyContract!,
      },
      signatured: signature,
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
    const [message, toSignatureMessage] = await settleMessage({
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
      domain: {
        name:'',
        version:'',
        chainId: this.chainId,
        verifyingContract:inputs.verifyContract!,
      },
      signatured: signature,
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
    // console.log('-- solanan call', {
    //   address,
    //   method,
    //   params,
    //   options,
    // })
    if (method === 'balanceOf') {

      const usdcPublicKey = new PublicKey(address);
      const userPublicKey = new PublicKey(this._address);
      const userUSDCAccount = getUSDCAccounts(usdcPublicKey,userPublicKey);
      const usdcamount = await getAccount(this._provider.connection,userUSDCAccount, 'confirmed');
      return usdcamount.amount;
    }
    if (method === 'allowance') {
      return MaxUint256;
    }
    return BigInt(0)


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
    console.log('-- solanan sendTransaction', {
      contractAddress,
      method,
      payload,
      options,
    })
    if (method === 'deposit') {
      return deposit({
        vaultAddress: contractAddress,
        userAddress: this._address,
        connection: this._provider.connection,
        depositData: payload.data[0],
        sendTransaction: this._provider.sendTransaction,

      })

    }
    
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
    console.log('-- params ', {
      chain,
      address,
      method,
      params,
    })
    if (method === 'getDepositFee') {
      return getDepositQuoteFee({
        vaultAddress: address,
        userAddress: this._address,
        connection: this._provider.connection,
        depositData: params[1]
      })


    }
    return 0;
    
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