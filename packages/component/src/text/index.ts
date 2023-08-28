import { Numeral } from "./numeral";
import { NumeralTotal } from "./numeralTotal";
import { NumeralWithConfig } from "./numeralWithConfig";
import { TradingPair } from "./tradingPair";
import { Text } from "./text";

export type CombinedComponent = typeof Numeral & {
  /**
   * 需要搭配 @orderly.network/hooks 使用
   */
  symbol: typeof NumeralWithConfig;
  total: typeof NumeralTotal;
};

const CombinedComponent = Numeral as CombinedComponent;
CombinedComponent.symbol = NumeralWithConfig;
CombinedComponent.total = NumeralTotal;

// (Numeral as CombinedComponent).symbol = NumeralWithConfig;

export type CombinedText = typeof Text & {
  tradingPair: typeof TradingPair;
};

const CombinedTextComponent = Text as CombinedText;

CombinedTextComponent.tradingPair = TradingPair;

//   export { Text };

export { CombinedComponent as Numeral, CombinedTextComponent as Text };
