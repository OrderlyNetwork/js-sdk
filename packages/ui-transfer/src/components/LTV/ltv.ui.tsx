import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Tooltip, Text } from "@orderly.network/ui";
import type { LtvScriptReturns } from "./ltv.script";

const ArrowRight: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      focusable={false}
      {...props}
    >
      <path
        d="M4.008 7.9952C4.008 7.6272 4.3062 7.3292 4.674 7.3292C4.99253 7.3292 8.71733 7.3292 9.71066 7.3292L7.73333 5.3312L8.66999 4.39453L11.8127 7.51654C11.9433 7.64654 12.008 7.8212 12.008 7.99587C12.008 8.16987 11.9427 8.34388 11.8127 8.47388L8.66999 11.5959L7.73333 10.6592L9.71066 8.66119C8.71733 8.66119 4.99253 8.66119 4.674 8.66119C4.3062 8.66119 4.008 8.3632 4.008 7.9952Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
    </svg>
  );
};

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

export const LtvUI: React.FC<Readonly<LtvScriptReturns>> = (props) => {
  // const { t } = useTranslation();
  const { from, to } = props;
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
      <Flex itemAlign="center" justify="between">
        <span className={cn("oui-select-none", calculateTextColor(from))}>
          {from}%
        </span>
        <ArrowRight className="oui-txt-white" />
        <span className={cn("oui-select-none", calculateTextColor(to))}>
          {to}%
        </span>
      </Flex>
    </Flex>
  );
};
