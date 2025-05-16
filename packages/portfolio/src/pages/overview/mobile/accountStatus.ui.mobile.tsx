import { FC, SVGProps, useCallback, useMemo } from "react";
import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import {
  cn,
  ArrowRightShortIcon,
  modal,
  toast,
  formatAddress,
  Flex,
  CopyIcon,
  ChainIcon,
  Popover,
} from "@orderly.network/ui";
import { ChainSelectorSheetId } from "@orderly.network/ui-chain-selector";
import {
  AuthGuard,
  WalletConnectorSheetId,
} from "@orderly.network/ui-connector";

interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
  titleClsName?: string;
}

const useCurrentStatus = () => {
  const { state, account } = useAccount();
  const { wrongNetwork, disabledConnect, connectWallet } = useAppContext();
  const { t } = useTranslation();

  const statusText = {
    wrongNetwork: {
      description: t("connector.wrongNetwork.tooltip"),
      rootClass: "oui-bg-[linear-gradient(15deg,#D25F00_-11%,transparent_30%)]",
    },
    connectWallet: {
      description: t("connector.trade.connectWallet.tooltip"),
      rootClass: "oui-bg-[linear-gradient(15deg,#27FDFE_-11%,transparent_30%)]",
    },
    notSignedIn: {
      description: t("connector.trade.signIn.tooltip"),
      rootClass: "oui-bg-[linear-gradient(15deg,#335FFC_-11%,transparent_30%)]",
    },
    disabledTrading: {
      description: t("connector.trade.enableTrading.tooltip"),
      rootClass: "oui-bg-[linear-gradient(15deg,#335FFC_-11%,transparent_30%)]",
    },
    default: {
      description: "",
      rootClass: "",
      arrowIconClass: "",
      textClass: "",
    },
  };

  return useMemo(() => {
    if (disabledConnect) {
      return statusText.connectWallet;
    }

    if (wrongNetwork) {
      return statusText.wrongNetwork;
    }

    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return statusText.connectWallet;
      case AccountStatusEnum.NotSignedIn:
        return statusText.notSignedIn;
      case AccountStatusEnum.DisabledTrading:
        return statusText.disabledTrading;
      default:
        return statusText.default;
    }
  }, [state.status, wrongNetwork]);
};

export function EVMChainPopover({ children }: { children: React.ReactNode }) {
  // const [chains] = useState(getChainsByNetwork("mainnet"));
  const [chains] = useChains("mainnet", {
    pick: "network_infos",
  });
  const { t } = useTranslation();

  return (
    <Popover
      content={
        <div>
          <div className="oui-px-3 oui-py-1 oui-text-base oui-font-semibold oui-text-base-contrast">
            {t("connector.privy.supportedEvmChain")}
          </div>
          <div className="oui-p-3 oui-grid oui-grid-cols-2 oui-gap-x-2 oui-gap-y-3 oui-text-2xs oui-text-base-contrast-54">
            {chains.map((item, key) => (
              <div
                key={key}
                className="oui-flex oui-items-center oui-justify-start oui-gap-1"
              >
                <ChainIcon chainId={item.chain_id} size="2xs" />
                <div>{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      }
      arrow={true}
      contentProps={{
        side: "bottom",
        align: "center",
        className: "oui-p-2 oui-z-[65]",
      }}
    >
      <button>{children}</button>
    </Popover>
  );
}

export const MoreIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    {...props}
  >
    <path d="M8.00521 6.66797C8.74161 6.66797 9.33854 7.26464 9.33854 8.0013C9.33854 8.73797 8.74161 9.33464 8.00521 9.33464C7.26881 9.33464 6.67188 8.73797 6.67188 8.0013C6.67188 7.26464 7.26881 6.66797 8.00521 6.66797Z" />
    <path d="M3.33333 6.66797C4.06973 6.66797 4.66667 7.26464 4.66667 8.0013C4.66667 8.73797 4.06973 9.33464 3.33333 9.33464C2.59693 9.33464 2 8.73797 2 8.0013C2 7.26464 2.59693 6.66797 3.33333 6.66797Z" />
    <path d="M12.6666 6.66797C13.403 6.66797 14 7.26464 14 8.0013C14 8.73797 13.403 9.33464 12.6666 9.33464C11.9302 9.33464 11.3333 8.73797 11.3333 8.0013C11.3333 7.26464 11.9302 6.66797 12.6666 6.66797Z" />
  </svg>
);

const EVMChains = () => {
  return (
    <div className="oui-relative oui-flex oui-items-center oui-justify-center">
      <div className="oui-flex oui-h-[18px] oui-items-center oui-justify-center ">
        <img
          src="https://oss.orderly.network/static/sdk/chains.png"
          className="oui-relative oui-z-0 oui-h-[18px] oui-w-[49px]"
        />
      </div>
      <div className="oui-relative oui-left-[-9px] oui-flex oui-items-center oui-justify-center oui-gap-1">
        <div className="oui-flex oui-size-[18px] oui-items-center oui-justify-center oui-rounded-full oui-bg-[#282e3a]">
          <EVMChainPopover>
            <MoreIcon
              className="oui-relative oui-z-10 oui-size-3 oui-text-base-contrast-54 hover:oui-text-base-contrast"
              style={{ zIndex: 1 }}
            />
          </EVMChainPopover>
        </div>
        <div className="oui-text-2xs oui-font-semibold oui-text-base-contrast">
          Evm
        </div>
      </div>
    </div>
  );
};

const ShowAccount: FC = () => {
  const { state, account } = useAccount();
  const { namespace } = useWalletConnector();
  const { t } = useTranslation();
  const onCopyAddress = () => {
    navigator.clipboard.writeText(state.address ?? "");
    toast.success(t("common.copy.copied"));
  };

  const leftNode = useMemo(() => {
    if (!state.address) {
      return;
    }
    return (
      <Flex className="oui-text-base oui-text-base-contrast" gapX={2}>
        {formatAddress(state.address ?? "")}
        <button
          className="oui-cursor-pointer"
          onClick={() => {
            onCopyAddress();
          }}
        >
          <CopyIcon
            size={18}
            className="oui-text-base-contrast-80"
            opacity={1}
          />
        </button>
      </Flex>
    );
  }, [state.address]);
  const rightNode = useMemo(() => {
    if (namespace === ChainNamespace.evm) {
      return <EVMChains />;
    }

    return (
      <Flex gapX={1} itemAlign={"center"} className="oui-text-2xs">
        <img
          src="https://oss.orderly.network/static/sdk/solana-logo.png"
          className="oui-w-[15px]"
        />
        Solana
      </Flex>
    );
  }, [namespace]);

  const bgClass = useMemo(() => {
    let bg = "";
    if (namespace == ChainNamespace.evm) {
      bg =
        "oui-bg-[linear-gradient(15deg,#283BEE_-11%,transparent_30%,transparent_77%,#A53411_100%)]";
    } else if (namespace == ChainNamespace.solana) {
      bg =
        "oui-bg-[linear-gradient(15deg,#7400D0_-11%,transparent_30%,transparent_77%,#009A7E_100%)]";
    }
    return bg;
  }, [namespace]);
  return (
    <div
      className={cn([
        "oui-flex oui-h-[44px] oui-w-full oui-items-center oui-justify-between oui-rounded-[10px] oui-px-3 oui-py-[10px]",
        bgClass,
      ])}
    >
      {leftNode}
      {rightNode}
    </div>
  );
};

export const AccountStatusMobile: FC = () => {
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();
  const { description, rootClass } = useCurrentStatus();

  const alreadyShowAccount = useMemo(() => {
    if (wrongNetwork) {
      return false;
    }
    return (
      state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
    );
  }, [state.status, wrongNetwork]);

  if (alreadyShowAccount) {
    return <ShowAccount />;
  }

  return (
    <div
      className={cn([
        "oui-flex oui-h-[44px] oui-w-full oui-items-center oui-justify-center oui-rounded-[10px] oui-px-3 oui-py-[10px]",
        rootClass,
        // "oui-bg-linear-65",
        // "oui-from-[-20%]",
        // "oui-to-[40%]",
        // " oui-from-[#FF7B00]",
        // " oui-to-[#FFEA00]",
      ])}
    >
      <div
        className={cn(
          "oui-flex oui-items-center oui-justify-end oui-rounded-[10px] oui-text-xs oui-font-semibold",
          "oui-text-base-contrast-54",
        )}
      >
        {description}
      </div>
    </div>
  );
};
