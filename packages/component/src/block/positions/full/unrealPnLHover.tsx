import { Divider } from "@/divider";
import { UnPnlPriceBasisCheckBox, UnPnlPriceBasisType } from "@/page/trading/desktop/sections/datalist/unPnlPriceBasisCheckBox";
import { useTabContext } from "@/tab/tabContext";
import { FC, useCallback } from "react";

export const UnrealizedPnLPopoverCard: FC<{
    unPnlPriceBasis: any;
    setUnPnlPriceBasic: any;
}> = (props) => {

  const {unPnlPriceBasis, setUnPnlPriceBasic} = props;
  const { updateData } = useTabContext();
  const onUnPnlPriceBasisChanged = useCallback((type: UnPnlPriceBasisType) => {
    var value: number = 0;
    switch (type) {
      case UnPnlPriceBasisType.MARKET_PRICE:
        value = 0;
        break;
      case UnPnlPriceBasisType.LAST_PRICE:
        value = 1;
        break;
    }
    updateData("unPnlPriceBasis", value);
    setUnPnlPriceBasic(type);
  }, [unPnlPriceBasis]);

  return (<div>
    <span>Current unrealized profit or loss on your open positions across all widgets calculated using Mark Price.</span>
    <Divider className="orderly-py-2 orderly-border-white/10" />
    <div className="orderly-mb-2">Unrealized PnL Price Basis</div>
    <UnPnlPriceBasisCheckBox value={unPnlPriceBasis} onValueChange={onUnPnlPriceBasisChanged} />
  </div>);
}