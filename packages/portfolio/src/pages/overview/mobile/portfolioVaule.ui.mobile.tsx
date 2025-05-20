import { FC, useMemo } from "react";
import { parseJSON, useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { Flex, Text, cn } from "@orderly.network/ui";
import { EyeIcon } from "@orderly.network/ui";

type Props = {
  portfolioValue: number | null;
  unrealPnL: number;
  unrealROI: number;
  visible: boolean;
  namespace: string | null;
  toggleVisible: () => void;
  canTrade: boolean;
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
        "oui-relative oui-items-start oui-gap-1 oui-overflow-hidden oui-rounded-2xl oui-bg-base-9",
        currentNamespace === ChainNamespace.evm && "oui-bg-[#283BEE]",
        currentNamespace === ChainNamespace.solana && "oui-bg-[#630EAD]",
      ])}
      p={4}
    >
      <Flex direction="row" gapX={1} itemAlign={"center"}>
        <Text className="oui-text-sm oui-text-base-contrast-54">
          Portfolio value
        </Text>
        <EyeIcon
          size={16}
          className={cn(
            props.canTrade ? "oui-text-base-contrast-54" : "oui-hidden",
          )}
          onClick={props.toggleVisible}
        />
      </Flex>
      <Flex direction="row" gapX={1} itemAlign={"center"}>
        <Text.numeral
          visible={props.visible}
          className="oui-text-base-contrast oui-text-xl  oui-font-bold"
        >
          {props.portfolioValue ?? "--"}
        </Text.numeral>
        <Text className="oui-text-base oui-font-bold  oui-text-base-contrast-80">
          USDC
        </Text>
      </Flex>
      <Flex
        direction="row"
        gapX={1}
        itemAlign={"center"}
        className="oui-text-base-contrast oui-text-sm"
      >
        <Text.numeral visible={props.visible}>
          {props.unrealPnL ?? "--"}
        </Text.numeral>
        <Text.numeral
          visible={props.visible}
          rule="percentages"
          prefix={"("}
          suffix={")"}
        >
          {props.unrealROI ?? "--"}
        </Text.numeral>
      </Flex>
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
