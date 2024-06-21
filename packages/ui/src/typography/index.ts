import { SymbolText } from "./symbol";

export { Statistic, StatisticLabel, statisticVariants } from "./statistic";

import { FormattedText } from "./formatted";
import { GradientText, gradientTextVariants } from "./gradient";
import { Numeral } from "./numeral";

import { Text as BaseText, textVariants } from "./text";
import type { TextProps } from "./text";

export type TextType = typeof BaseText & {
  formatted: typeof FormattedText;
  numeral: typeof Numeral;
  gradient: typeof GradientText;
  // symbol: typeof SymbolText;
};

const Text = BaseText as TextType;
Text.formatted = FormattedText;
Text.numeral = Numeral;
Text.gradient = GradientText;
// Text.symbol = SymbolText;

export { Text, textVariants, gradientTextVariants };
export type { TextProps };
