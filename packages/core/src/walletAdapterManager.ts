import { WalletAdapter } from "./wallet/walletAdapter";
import { ChainNamespace} from "@orderly.network/types";
import { Eip1193Provider } from "ethers";
import { IContract } from "./contract";

class WalletAdapterManager {
  private _adapter!: WalletAdapter;

  constructor(private readonly walletAdapters: WalletAdapter[]) {
    if (!this.walletAdapters.length) {
      throw new Error("No wallet adapters provided");
    }
  }

  /**
   * return the current wallet adapter
   */
  get adapter(): WalletAdapter | undefined {
    // if (!this._adapter) {
    //   throw new SDKError("No wallet adapter found");
    // }
    return this._adapter;
  }

  get isEmpty(): boolean {
    return this.walletAdapters.length === 0;
  }

  /**
   * check if the current wallet adapter is exist
   */
  get isAdapterExist(): boolean {
    return !!this._adapter;
  }

  /**
   * set the current wallet adapter
   */
  switchWallet(
    chainNamespace: ChainNamespace,
    address: string,
    chainId: number,
    options: {
      provider?: Eip1193Provider;
      contractManager?: IContract;
    }
  ) {
    console.log('-- this.walletAdapters', this.walletAdapters, chainNamespace);
    const adapter = this.walletAdapters.find(
      (adapter) => adapter.chainNamespace === chainNamespace.toUpperCase()
    );

    if (!adapter) {
      throw new Error("Unsupported chain namespace");
    }

    const config = {
      address,
      chain: { id: chainId },
      provider: options.provider,
      contractManager: options.contractManager,
    };

    console.log("------+++++---", config);

    /**
     * lifecycle
     */
    if (this._adapter) {
      if (this._adapter === adapter) {
        this._adapter.update(config);
        return;
      } else {
        this._adapter.deactivate();
      }
    }
    this._adapter = adapter;
    this._adapter.active(config);
  }

  get chainId() {
    return this.adapter?.chainId;
  }
}

export { WalletAdapterManager };
