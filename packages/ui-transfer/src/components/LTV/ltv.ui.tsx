import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Tooltip, Text } from "@orderly.network/ui";

const TooltipIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      focusable={false}
      ref={ref}
      {...props}
    >
      <path d="M5.999 1.007a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1m0 1.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0v-2.5a.5.5 0 0 1 .5-.5" />
    </svg>
  );
});

const calculateTextColor = (val: number): string => {
  if (val >= 0 && val < 50) {
    return "oui-text-success";
  } else if (val >= 50 && val < 80) {
    return "oui-text-warning";
  } else if (val >= 80) {
    return "oui-text-danger";
  } else {
    return "";
  }
};

export const LtvUI: React.FC<
  Readonly<{ currentLtv: number; nextLTV: number; showDiff?: boolean }>
> = (props) => {
  // const { t } = useTranslation();
  const { currentLtv, nextLTV, showDiff } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex justify="start" itemAlign="center">
        <Text size="xs" intensity={36}>
          LTV
        </Text>
        <Tooltip content={"Tooltip content"}>
          <TooltipIcon className="oui-ml-[2px] oui-cursor-pointer oui-text-base-contrast-36" />
        </Tooltip>
      </Flex>
      {showDiff ? (
        <Flex itemAlign="center" justify="between" gap={1}>
          <span
            className={cn("oui-select-none", calculateTextColor(currentLtv))}
          >
            {currentLtv}%
          </span>
          →
          <span className={cn("oui-select-none", calculateTextColor(nextLTV))}>
            {nextLTV}%
          </span>
        </Flex>
      ) : (
        <span className={cn("oui-select-none", calculateTextColor(currentLtv))}>
          {currentLtv}%
        </span>
      )}
    </Flex>
  );
};
