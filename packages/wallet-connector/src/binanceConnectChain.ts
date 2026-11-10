import type { AppState, InitOptions, OnboardAPI } from "@web3-onboard/core";

/**
 * Binance's connector derives its initial provider chainId from chains[0].
 * Since Onboard has no connect-time chainId option, this wrapper moves the
 * requested chain to the front when getInterface runs, including autoSelect.
 * The configured chain list and other wallet modules remain unchanged.
 */

type WalletModule = AppState["walletModules"][number];
type ConnectChainId = number | string | undefined;
type ChainSelection = {
  chainId: ConnectChainId;
  getChainId: () => ConnectChainId;
};

const connectionChains = new WeakMap<OnboardAPI, ChainSelection>();

const originalModules = new WeakMap<WalletModule, WalletModule>();
const chainGetters = new WeakMap<WalletModule, () => ConnectChainId>();

/** Wrap Binance's interface to prioritize the requested initial provider chain. */
export function withBinanceConnectChain(
  walletModule: WalletModule,
  chainId?: number | string | (() => ConnectChainId),
): WalletModule {
  if (
    typeof chainId === "function" &&
    chainGetters.get(walletModule) === chainId
  ) {
    return walletModule;
  }
  const original = originalModules.get(walletModule) ?? walletModule;
  if (original.label !== "Binance" || chainId === undefined) {
    return original;
  }

  const wrapped: WalletModule = {
    ...original,
    getInterface: (helpers) => {
      const selectedChainId =
        typeof chainId === "function" ? chainId() : chainId;
      const selectedChain = helpers.chains.find(
        (chain) => Number(chain.id) === Number(selectedChainId),
      );

      // Binance's connector uses the first chain to create its provider.
      return original.getInterface({
        ...helpers,
        chains: selectedChain
          ? [
              selectedChain,
              ...helpers.chains.filter((chain) => chain !== selectedChain),
            ]
          : helpers.chains,
      });
    },
  };

  // Reconnecting must replace the previous selection, without nesting wrappers.
  originalModules.set(wrapped, original);
  if (typeof chainId === "function") chainGetters.set(wrapped, chainId);
  return wrapped;
}

/** Wrap the initializers, since Onboard creates wallet modules on first connect. */
export function initWithBinanceConnectChain(
  options: InitOptions,
  initialize: (options: InitOptions) => OnboardAPI,
): OnboardAPI {
  let selection: ChainSelection = {
    chainId: undefined,
    getChainId: () => selection.chainId,
  };
  const wallets: InitOptions["wallets"] = options.wallets.map(
    (walletInit) => (helpers) => {
      const modules = walletInit(helpers);
      if (Array.isArray(modules)) {
        return modules.map((module) =>
          withBinanceConnectChain(module, selection.getChainId),
        );
      }
      return modules
        ? withBinanceConnectChain(modules, selection.getChainId)
        : modules;
    },
  );
  const onboard = initialize({ ...options, wallets });
  // Onboard can return the same API when initialized again.
  selection = connectionChains.get(onboard) ?? selection;
  connectionChains.set(onboard, selection);
  return onboard;
}

/** Return a stable reader so existing modules do not need to be registered again. */
export function setBinanceConnectChain(
  onboard: OnboardAPI | undefined,
  chainId: ConnectChainId,
): ChainSelection["getChainId"] | undefined {
  const selection = onboard && connectionChains.get(onboard);
  if (!selection) return undefined;
  selection.chainId = chainId;
  return selection.getChainId;
}
