import { FormattedText } from "./formatted";
import { Numeral } from "./numeral";

import { Text as BaseText, textVariants } from "./text";
import type { TextProps } from "./text";

export type TextType = typeof BaseText & {
  formatted: typeof FormattedText;
  numeral: typeof Numeral;
};

const Text = BaseText as TextType;
Text.formatted = FormattedText;
Text.numeral = Numeral;

export { Text, textVariants };
export type { TextProps };
