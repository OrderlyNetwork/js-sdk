import { FC } from "react";
import { Flex, Text, cn } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

type Props = {
  portfolioValue: number | null;
  unrealPnL: number;
  unrealROI: number;
  visible: boolean;
  namespace: string | null;
};

export const PortfolioValueMobile: FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      height={"100%"}
      className={cn(["oui-bg-base-9 oui-rounded-2xl oui-relative oui-gap-1 oui-items-start oui-overflow-hidden",
        props.namespace === "EVM" && "oui-bg-[#283BEE]",
        props.namespace === "SOL" && "oui-bg-[#630EAD]"
      ])}
      p={4}>
      <Text className="oui-text-sm oui-text-base-contrast-54">Portfolio value</Text>
      <Flex direction="row" gapX={1} itemAlign={"center"}>
        <Text.numeral visible={props.visible} className="oui-text-xl oui-font-bold  oui-text-base-contrast-98">
          {props.portfolioValue ?? '--'}
        </Text.numeral>
        <Text className="oui-text-base oui-font-bold  oui-text-base-contrast-80">USDC</Text>
      </Flex>
      <Flex direction="row" gapX={1} itemAlign={"center"} className="oui-text-sm oui-text-base-contrast-98">
        <Text.numeral visible={props.visible}>{props.unrealPnL ?? '--'}</Text.numeral>
        <Text.numeral visible={props.visible} rule="percentages" prefix={"("} suffix={")"}>
          {props.unrealROI ?? '--'}
        </Text.numeral>
      </Flex>
      <div className="oui-absolute -oui-top-5 -oui-right-[30px] oui-w-[151px] oui-h-[151px] oui-bg-[url('https://oss.orderly.network/static/sdk/wallet-card-bg.png')] oui-bg-contain oui-bg-no-repeat oui-bg-center" />
    </Flex>
  );
};
