import { Flex, Text, ArrowDownSquareFillIcon, ArrowUpSquareFillIcon, CalendarMinusIcon } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";
import { FC } from "react";

type Props = {
  disabled: boolean;
  onWithdraw?: () => void;
  onDeposit?: () => void;
};

export const PortfolioHandleMobile: FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex direction={"row"} width={"100%"} height={"71px"} className="oui-bg-transparent oui-gap-3" >
      <Flex direction="column" gapY={2} itemAlign={"center"} className="oui-flex-1 oui-cursor-pointer" onClick={props?.onWithdraw}>
        <div className="oui-bg-base-9 oui-rounded-xl oui-flex oui-items-center oui-justify-center oui-w-[48px] oui-h-[48px]">
          <ArrowDownSquareFillIcon size={28} color="white" opacity={1}/>
        </div>
        <Text className="oui-text-2xs oui-text-base-80">
          {t("common.withdraw")}
        </Text>
      </Flex>
      <Flex direction="column" gapY={2} itemAlign={"center"} className="oui-flex-1 oui-cursor-pointer" onClick={props?.onDeposit}>
        <div className="oui-bg-base-9 oui-rounded-xl oui-flex oui-items-center oui-justify-center oui-w-[48px] oui-h-[48px]">
          <ArrowUpSquareFillIcon size={28} color="white" opacity={1}/>
        </div>
        <Text className="oui-text-2xs oui-text-base-80">
          {t("common.deposit")}
        </Text>
      </Flex>
      <Flex direction="column" gapY={2} itemAlign={"center"} className="oui-flex-1 oui-cursor-pointer">
        <div className="oui-bg-base-9 oui-rounded-xl oui-flex oui-items-center oui-justify-center oui-w-[48px] oui-h-[48px]">
          <CalendarMinusIcon size={28} color="white" opacity={1}/>
        </div>
        <Text className="oui-text-2xs oui-text-base-80">
          {t("trading.history")}
        </Text>
      </Flex>
    </Flex>
  )
};
