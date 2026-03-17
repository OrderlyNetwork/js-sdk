import React from "react";
import { Badge } from "../badge/badge";
import { FormattedText, FormattedTextProps } from "./formatted";
import { TextElement } from "./text";

export type SymbolBadgeTextProps = FormattedTextProps & {
  /**
   * Optional badge text shown after the main content. When set, renders as Badge (warning, xs).
   */
  badge?: string;
  formatString?: string;
};

export const SymbolBadgeText = React.forwardRef<
  TextElement,
  SymbolBadgeTextProps
>((props, ref) => {
  const { badge, formatString, rule, ...rest } = props;
  const suffix =
    badge != null && badge !== "" ? <SymbolBadge badge={badge} /> : undefined;
  return (
    <FormattedText
      rule={"symbol"}
      formatString={"base"}
      {...rest}
      suffix={suffix}
      ref={ref}
    />
  );
});

SymbolBadgeText.displayName = "SymbolBadgeText";

export const SymbolBadge = (props: { badge?: string }) => {
  const { badge } = props;
  if (!badge) return null;

  return (
    <Badge color="neutral" size="xs" className="oui-ml-1">
      {badge}
    </Badge>
  );
};
