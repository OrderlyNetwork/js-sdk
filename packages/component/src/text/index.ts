import { Numeral } from "./numeral";
import { NumeralTotal } from "./numeralTotal";
import { NumeralWithSymbol } from "./numeralWithSymbol";
import { NumeralWithCtx } from "./numeralWithCtx";
import { TradingPair } from "./tradingPair";
import { Text } from "./text";

export type CombinedComponent = typeof Numeral & {
  symbol: typeof NumeralWithSymbol;
  total: typeof NumeralTotal;
  withCtx: typeof NumeralWithCtx;
};

const CombinedComponent = Numeral as CombinedComponent;
CombinedComponent.symbol = NumeralWithSymbol;
CombinedComponent.total = NumeralTotal;
CombinedComponent.withCtx = NumeralWithCtx;

// (Numeral as CombinedComponent).symbol = NumeralWithConfig;

export type CombinedText = typeof Text & {
  tradingPair: typeof TradingPair;
};

const CombinedTextComponent = Text as CombinedText;

CombinedTextComponent.tradingPair = TradingPair;

//   export { Text };

export { CombinedComponent as Numeral, CombinedTextComponent as Text };
