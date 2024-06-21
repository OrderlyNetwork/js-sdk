import { FC, PropsWithChildren, cloneElement, useMemo } from "react";
import { ChainIcon, ChainIconProps } from "./chainIcon";
import { TokenIcon, TokenIconProps } from "./tokenIcon";

export type CombineIconProps = {
  secondary: ChainIconProps | TokenIconProps;
};

export const CombineIcon: FC<PropsWithChildren<CombineIconProps>> = (props) => {
  const subElement = useMemo(() => {
    const className =
      "oui-bg-base-6 oui-absolute oui-bottom-0 oui-right-0 oui-outline oui-outline-2 oui-outline-base-1 oui-z-10";
    if ("chainId" in props.secondary) {
      return <ChainIcon {...props.secondary} className={className} />;
    } else {
      return <TokenIcon {...props.secondary} className={className} />;
    }
  }, [props.secondary]);

  return (
    <div className="oui-relative">
      {props.children}
      {subElement}
    </div>
  );
};
