import React from "react";
import { Badge } from "../badge/badge";
import { Box } from "../box";
import { useScreen } from "../hooks";
import { modal } from "../modal";
import { Tooltip } from "../tooltip/tooltip";
import { FormattedText, FormattedTextProps } from "./formatted";
import { TextElement } from "./text";

export type SymbolBadgeTextProps = FormattedTextProps & {
  /**
   * Optional badge text shown after the main content. When set, renders as Badge (warning, xs).
   */
  badge?: string;
  /** Full broker name; when set, badge shows it on hover via Tooltip. */
  fullName?: string;
  formatString?: string;
};

export const SymbolBadgeText = React.forwardRef<
  TextElement,
  SymbolBadgeTextProps
>((props, ref) => {
  const { badge, formatString, rule, fullName, ...rest } = props;
  const suffix =
    badge != null && badge !== "" ? (
      <SymbolBadge badge={badge} fullName={fullName} />
    ) : undefined;
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

export const SymbolBadge = (props: { badge?: string; fullName?: string }) => {
  const { badge, fullName } = props;
  const { isMobile } = useScreen();
  if (!badge) return null;

  const badgeEl = (
    <Badge color="neutral" size="xs" className="oui-ml-1">
      {badge}
    </Badge>
  );

  if (!fullName) return badgeEl;

  if (isMobile) {
    return (
      <Box
        className="oui-inline-flex oui-cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          modal.alert({
            message: fullName,
          });
        }}
      >
        {badgeEl}
      </Box>
    );
  }

  return (
    <Tooltip content={fullName}>
      <span className="oui-inline-flex oui-cursor-pointer">{badgeEl}</span>
    </Tooltip>
  );
};
