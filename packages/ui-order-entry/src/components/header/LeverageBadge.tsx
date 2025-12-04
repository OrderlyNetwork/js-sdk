import { useSymbolLeverage } from "@veltodefi/hooks";
import { OrderSide } from "@veltodefi/types";
import { cn, Flex, modal, Text, useScreen } from "@veltodefi/ui";
import {
  SymbolLeverageDialogId,
  SymbolLeverageSheetId,
} from "@veltodefi/ui-leverage";
import { Decimal } from "@veltodefi/utils";

type LeverageBadgeProps = {
  symbol: string;
  side: OrderSide;
  symbolLeverage?: number;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, side, symbolLeverage } = props;
  const { isMobile } = useScreen();
  const { maxLeverage } = useSymbolLeverage(symbol);

  const curLeverage = symbolLeverage || maxLeverage;

  const showModal = () => {
    const modalId = isMobile ? SymbolLeverageSheetId : SymbolLeverageDialogId;
    modal.show(modalId, {
      symbol,
      side,
      curLeverage,
    });
  };

  return (
    <Flex
      justify="center"
      itemAlign="center"
      gapX={1}
      className={cn(
        "oui-h-8",
        "oui-rounded oui-border oui-border-line oui-bg-base-6",
        "oui-cursor-pointer oui-select-none oui-text-xs oui-font-semibold oui-text-base-contrast-54",
      )}
      onClick={showModal}
    >
      <Text>Cross</Text>
      <Text.numeral dp={0} rm={Decimal.ROUND_DOWN} unit="X">
        {curLeverage}
      </Text.numeral>
    </Flex>
  );
};
