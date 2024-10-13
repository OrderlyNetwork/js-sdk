import { SolanaAdapterOption, SolanaWalletProvider } from "./types";
import {
  AddOrderlyKeyInputs,
  BaseWalletAdapter, ChainNamespace, Message, RegisterAccountInputs, SettleInputs, SignatureDomain, WithdrawInputs
} from "@orderly.network/core";
import {API, MaxUint256} from "@orderly.network/types";
import * as ed from "@noble/ed25519";
import { encode as bs58encode, decode as bs58Decode } from "bs58";
import {addOrderlyKeyMessage, registerAccountMessage, withdrawMessage} from "./helper";
import { bytesToHex } from "ethereum-cryptography/utils";
import { getAccount } from "@solana/spl-token";
import {
  getBrokerPDA, getDefaultSendConfigPda,
  getDefaultSendLibConfigPda, getDvnConfigPda,
  getEndorcedOptionsPda,
  getEndpointSettingPda,
  getEventAuthorityPda, getExecutorConfigPda, getLookupTableAccount, getLookupTableAddress,
  getNoncePda,
  getOAppConfigPda,
  getPeerPda, getPriceFeedPda, getSendConfigPda,
  getSendLibConfigPda,
  getSendLibInfoPda,
  getSendLibPda,
  getTokenPDA, getUlnEventAuthorityPda, getUlnSettingPda,
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


    return {
      message: {
        ...message,
        chainType: "SOL"
      },
      domain: {
        name:'',
        version:'',
        chainId:902902902,
        verifyingContract:'0x8794E7260517B1766fc7b55cAfcd56e6bf08600e',
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
      const appProgramId = new PublicKey(contractAddress);
      const program = new Program<SolanaVault>(VaultIDL,
          appProgramId,
          {
            connection: this._provider.connection,
          });
      const depositData = payload.data[0];
      const usdc = new PublicKey(depositData.USDCAddress);
      const userPublicKey = new PublicKey(this._address);
      const userUSDCAccount = getUSDCAccounts(usdc,userPublicKey);
      const vaultAuthorityPda = getVaultAuthorityPda(appProgramId)
      const vaultUSDCAccount = getUSDCAccounts(usdc, vaultAuthorityPda)

      const brokerHash = depositData.brokerHash;
      const codedBrokerHash = Array.from(Buffer.from(brokerHash.slice(2), 'hex'));

      const tokenHash = depositData.tokenHash;
      const codedTokenHash = Array.from(Buffer.from(tokenHash.slice(2), 'hex'));


      const solAccountId = depositData.accountId;
      const codedAccountId =Array.from(Buffer.from(solAccountId.slice(2), 'hex'));

      const allowedBrokerPDA = getBrokerPDA(appProgramId, brokerHash);
      const allowedTokenPDA = getTokenPDA(appProgramId,tokenHash);
      const oappConfigPDA = getOAppConfigPda(appProgramId);
      console.log('-- oappconfig pda', oappConfigPDA.toBase58());
      // const lzPDA = getLzReceiveTypesPda(appProgramId, oappConfigPDA);
      const peerPDA = getPeerPda(appProgramId, oappConfigPDA, DST_EID);
      const endorcedPDA = getEndorcedOptionsPda(appProgramId, oappConfigPDA, DST_EID);
      const sendLibPDA = getSendLibPda();
      const sendLibConfigPDA = getSendLibConfigPda(oappConfigPDA, DST_EID);
      const defaultSendLibPDA = getDefaultSendLibConfigPda(DST_EID);
      const sendLibInfoPDA = getSendLibInfoPda(sendLibPDA);

      const endpointSettingPDA = getEndpointSettingPda();
      const noncePDA = getNoncePda(appProgramId, oappConfigPDA, DST_EID);
      const eventAuthorityPDA = getEventAuthorityPda();
      const ulnSettingPDA = getUlnSettingPda();
      const sendConfigPDA = getSendConfigPda(oappConfigPDA, DST_EID);
      const defaultSendConfigPDA = getDefaultSendConfigPda(DST_EID);
      const ulnEventAuthorityPDA= getUlnEventAuthorityPda();
      const executorConfigPDA= getExecutorConfigPda();
      const priceFeedPDA = getPriceFeedPda();
      const dvnConfigPDA = getDvnConfigPda();

      const vaultDepositParams = {
        accountId:  codedAccountId,
        brokerHash: codedBrokerHash,
        tokenHash:  codedTokenHash,
        userAddress: Array.from(userPublicKey.toBuffer()),
        tokenAmount: new BN(depositData.tokenAmount),
      };


      const sendParam = {
        // todo need caculate fee
        nativeFee: new BN(1_000_000_000),
        lzTokenFee:new BN(0),

      }
      console.log('--- value params', {
        vaultDepositParams,
        sendParam,
      });
      const ixDepositEntry = await program.methods.deposit(vaultDepositParams, sendParam).accounts({
        userTokenAccount: userUSDCAccount,
        vaultAuthority: vaultAuthorityPda,
        vaultTokenAccount: vaultUSDCAccount,
        depositToken: usdc,
        user:userPublicKey,
        peer:peerPDA,
        enforcedOptions:endorcedPDA,
        oappConfig: oappConfigPDA,
        allowedBroker: allowedBrokerPDA,
        allowedToken: allowedTokenPDA
      }).remainingAccounts([
        // ENDPOINT solana/programs/programs/uln/src/instructions/endpoint/send.rs
        {
          isSigner: false,
          isWritable: false,
          pubkey: ENDPOINT_PROGRAM_ID,
        },
        {
          isSigner: false,
          isWritable: false,
          // 0
          pubkey: oappConfigPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SEND_LIB_PROGRAM_ID,
        },
        {
          isSigner: false,
          isWritable: false,
          // 7
          pubkey:sendLibConfigPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 9
          pubkey: defaultSendLibPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 8
          pubkey:sendLibInfoPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 14
          pubkey: endpointSettingPDA,
        },
        {
          isSigner: false,
          isWritable: true,
          // 15
          pubkey: noncePDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 3
          pubkey:eventAuthorityPDA,
        },
        // ULN solana/programs/programs/uln/src/instructions/endpoint/send.rs
        {
          isSigner: false,
          isWritable: false,
          pubkey: ENDPOINT_PROGRAM_ID,
        },
        {
          isSigner: false,
          isWritable: false,
          // 13
          pubkey: ulnSettingPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 10
          pubkey: sendConfigPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          // 11
          pubkey: defaultSendConfigPDA,
        },
        {
          isSigner: true,
          isWritable: false,
          pubkey:userPublicKey,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: TREASURY_PROGRAM_ID,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SystemProgram.programId,
        },
        {
          isSigner: false,
          isWritable: false,
          // 12
          pubkey: ulnEventAuthorityPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SEND_LIB_PROGRAM_ID
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: EXECUTOR_PROGRAM_ID
        },
        {
          isSigner: false,
          isWritable: true,
          // 16
          pubkey:executorConfigPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: PRICE_FEED_PROGRAM_ID
        },
        {
          isSigner: false,
          isWritable: false,
          // 17
          pubkey: priceFeedPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: DVN_PROGRAM_ID
        },
        {
          isSigner: false,
          isWritable: true,
          // 18
          pubkey:dvnConfigPDA,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: PRICE_FEED_PROGRAM_ID
        },
        {
          isSigner: false,
          isWritable: false,
          // 17
          pubkey: priceFeedPDA,
        }
      ]).instruction();

      ixDepositEntry.keys.map(item => {
        console.log(item.pubkey.toBase58());
      })
      const lookupTableAddress = getLookupTableAddress(appProgramId);
      const lookupTableAccount = await getLookupTableAccount(this._provider.connection, lookupTableAddress);
      if (!lookupTableAccount) {
        console.log('-- lookup table account error');
        return;
      }


      const ixAddComputeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });

      console.log('-- idx', ixDepositEntry, ixAddComputeBudget);
      const lastBlockHash =await this._provider.connection.getLatestBlockhash() ;
      const msg = new TransactionMessage({
        payerKey:userPublicKey,
        recentBlockhash: lastBlockHash.blockhash,
        instructions: [ixDepositEntry, ixAddComputeBudget],

      }).compileToV0Message([lookupTableAccount]);

      const tx = new VersionedTransaction(msg);

      const res = await this._provider.sendTransaction(tx, this._provider.connection)
      console.log('res', res);
      return res;
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