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
  getUSDCAccounts,
} from "./solana.util";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
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
  uint8ArrayToHexString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async signMessage(message: Uint8Array, isLedger?:boolean): Promise<string>{
    console.log('-- isledger',isLedger);
    if (isLedger) {
      // todo

      // 创建一个 transaction
      const transaction = new Transaction();

      // 添加 ComputeBudget 的 setComputeUnitLimit 指令 (值设为0)
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
          data: new Uint8Array([3, 0, 0, 0, 0, 0, 0, 0, 0]) as Buffer  // 第一个字节是指令类型(3)，后面8字节是值(0)
        })
      );

      // 添加 ComputeBudget 的 setComputeUnitPrice 指令 (值设为0)
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
          data: new Uint8Array([2, 0, 0, 0, 0]) as Buffer  // 第一个字节是指令类型(2)，后面4字节是值(0)
        })
      );

      // 添加 Memo 指令
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: message as Buffer,
        })
      );

      const userPublicKey = new PublicKey(this.address);

      // 设置交易的参数
      transaction.feePayer = userPublicKey;

      // 创建一个全0的32字节 blockhash
      const zeroHash = new Uint8Array(32).fill(0);
      transaction.recentBlockhash = new PublicKey(zeroHash).toString();

      // 打印交易的详细结构
      console.log("Transaction structure before signing:");
      console.log("Number of instructions:", transaction.instructions.length);
      transaction.instructions.forEach((instruction, index) => {
        console.log(`Instruction ${index}:`, {
          programId: instruction.programId.toBase58(),
          keys: instruction.keys,
          data: this.uint8ArrayToHexString(instruction.data)
        });
      });

      // 打印序列化的交易数据
      const serializedTx = transaction.serialize({requireAllSignatures: false}).toString('hex');
      console.log("Serialized transaction (before signing):", serializedTx);

      // 签名交易
      const signedTransaction = await this._provider.signTransaction(transaction);

      console.log("Signed transaction:", signedTransaction);

      // 打印签名后交易的详细结构
      console.log("Transaction structure after signing:");
      console.log("Number of instructions:", signedTransaction.instructions.length);
      signedTransaction.instructions.forEach((instruction: TransactionInstruction, index: number) => {
        console.log(`Instruction ${index}:`, {
          programId: instruction.programId.toBase58(),
          keys: instruction.keys,
          data: this.uint8ArrayToHexString(instruction.data)
        });
      });

      // 打印序列化的已签名交易数据
      const serializedSignedTx = signedTransaction.serialize().toString('hex');
      console.log("Serialized transaction (after signing):", serializedSignedTx);

      // 获取交易的签名
      const signature = signedTransaction.signatures[0].signature;
      if (signature) {
        console.log("Signature:", this.uint8ArrayToHexString(signature));
        return this.uint8ArrayToHexString(signature);
      } else{
        console.log('-- sign message error', signature);
        throw new Error('Unsupported signature');
      }

    }
    const signRes = await this._provider.signMessage(message);
    return  '0x' + bytesToHex(signRes);
  }

  async generateRegisterAccountMessage(inputs: RegisterAccountInputs): Promise<Message> {
    const [message, toSignatureMessage] = registerAccountMessage({
      ...inputs,
      chainId: this.chainId,
    });

    const signature = await this.signMessage(toSignatureMessage as Uint8Array, true)

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
    const signature = await this.signMessage(toSignatureMessage as Uint8Array, true)

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
    console.log('-- generateAddOrderlyKeyMessage', inputs);
    try {

      console.log('-- test error');
      // Signing off chain messages with Ledger is not yet supported.
      const signature = await this.signMessage(toSignatureMessage as Uint8Array, true);

      return {
        message: {
          ...message,
          chainType: "SOL"
        },
        signatured: signature,
      };
    } catch (e) {
      console.log('--  sign message error e', e);
      if (e && e instanceof Error) {
        if (e.message.indexOf('Signing off chain messages with Ledger is not yet supported')) {
          throw new Error('isLedger');
        }
      }
      throw e;

    }


  }

  async generateSettleMessage(inputs: SettleInputs): Promise<Message & {domain: SignatureDomain}> {
    const [message, toSignatureMessage] = await settleMessage({
      ...inputs,
      chainId: this.chainId,
    });
    const signature = await this.signMessage(toSignatureMessage as Uint8Array, true)
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