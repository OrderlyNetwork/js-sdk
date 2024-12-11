import { useLiquidationScript } from "./liquidation.script";
import { Liquidation, MobileLiquidation } from "./liquidation.ui";

export type LiquidationProps = {
    symbol?: string;
}

export const LiquidationWidget = (props: LiquidationProps) => {
    const state = useLiquidationScript(props);
    return (<Liquidation {...state} />);
};

export const MobileLiquidationWidget = (props: LiquidationProps & {
    classNames?: {
      root?: string;
      content?: string;
      cell?: string;
    };
  }) => {

    const { classNames, ...rest} = props;
    const state = useLiquidationScript(rest);
    return (<MobileLiquidation classNames={classNames} {...state} />);
};
