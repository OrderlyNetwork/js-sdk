import { FC, useMemo } from "react";
import { parseJSON, useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import {
  Flex,
  Text,
  cn,
  ArrowRightShortIcon,
  EyeIcon,
} from "@orderly.network/ui";
import { RouterAdapter } from "@orderly.network/ui-scaffold";
import { PortfolioLeftSidebarPath } from "../../../layout";

type Props = {
  portfolioValue: number | null;
  unrealPnL: number;
  unrealROI: number;
  visible: boolean;
  namespace: string | null;
  toggleVisible: () => void;
  canTrade: boolean;
  routerAdapter?: RouterAdapter;
};

export const PortfolioValueMobile: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { state } = useAccount();

  const currentNamespace = useMemo(() => {
    if (props.namespace) {
      return props.namespace;
    }
    if (state.status === AccountStatusEnum.EnableTradingWithoutConnected) {
      return getLinkDeviceStorage()?.chainNamespace;
    }
    return null;
  }, [props.namespace, state.status]);
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      height={"100%"}
      className={cn([
        "oui-relative oui-items-start oui-overflow-hidden oui-rounded-2xl oui-bg-base-9",
        currentNamespace === ChainNamespace.evm && "oui-bg-[#283BEE]",
        currentNamespace === ChainNamespace.solana && "oui-bg-[#630EAD]",
      ])}
      p={4}
    >
      <Flex direction="row" gapX={1} itemAlign={"center"}>
        <Text className="oui-text-sm oui-text-base-contrast-54">
          {t("portfolio.overview.handle.title")}
        </Text>
        <EyeIcon
          size={16}
          className={cn(
            props.canTrade ? "oui-text-base-contrast-54" : "oui-hidden",
          )}
          onClick={props.toggleVisible}
        />
      </Flex>
      <Flex
        direction="row"
        gapX={1}
        itemAlign={"baseline"}
        className="oui-mt-1"
      >
        <Text.numeral
          visible={props.visible}
          className="oui-text-3xl oui-font-bold oui-text-base-contrast"
        >
          {props.portfolioValue ?? "--"}
        </Text.numeral>
        <Text className="oui-text-base oui-font-bold oui-text-base-contrast-80">
          USDC
        </Text>
      </Flex>
      <Flex
        direction="row"
        gapX={1}
        itemAlign={"center"}
        className="oui-text-sm oui-text-base-contrast"
      >
        <Text.pnl visible={props.visible}>{props.unrealPnL ?? "--"}</Text.pnl>
        <Text.roi
          visible={props.visible}
          rule="percentages"
          prefix={"("}
          suffix={")"}
        >
          {props.unrealROI ?? "--"}
        </Text.roi>
      </Flex>
      <div
        className="oui-absolute oui-right-0 oui-top-0 oui-flex oui-h-full oui-items-center oui-justify-center oui-px-4"
        onClick={() =>
          props.routerAdapter?.onRouteChange({
            href: PortfolioLeftSidebarPath.Assets,
            name: "Assets",
          })
        }
      >
        <ArrowRightShortIcon size={18} color="white" opacity={0.54} />
      </div>
    </Flex>
  );
};

type LinkDeviceStorage = { chainId: number; chainNamespace: ChainNamespace };

function getLinkDeviceStorage() {
  try {
    const linkDeviceStorage = localStorage.getItem("orderly_link_device");
    const json = linkDeviceStorage ? parseJSON(linkDeviceStorage) : null;
    return json as LinkDeviceStorage;
  } catch (err) {
    console.error("getLinkDeviceStorage", err);
  }
}
