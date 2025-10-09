import { FormattedText } from "./formatted";
import { GradientText, gradientTextVariants } from "./gradient";
import { Numeral } from "./numeral";
import { Text as BaseText, textVariants } from "./text";
import type { TextProps } from "./text";

export { Statistic, StatisticLabel, statisticVariants } from "./statistic";

export type { NumeralProps } from "./numeral";
export { parseNumber, formatAddress } from "./utils";

export type TextType = typeof BaseText & {
  formatted: typeof FormattedText;
  numeral: typeof Numeral;
  gradient: typeof GradientText;
};

const Text = BaseText as TextType;
Text.formatted = FormattedText;
Text.numeral = Numeral;
Text.gradient = GradientText;

export { Text, textVariants, gradientTextVariants, GradientText };
export type { TextProps };
