import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { KlineDragIcon } from "../../base/icons";
import { TradingviewState } from "./tradingview.script";
import { cn } from "@orderly.network/ui";

export function TradingviewUi(props: TradingviewState) {
  return (
    <div
      className="oui-pb-1 oui-flex oui-flex-col oui-gap-1"
      style={{ height: props.height }}
      ref={props.boxRef}
    >
      <div className="oui-w-full oui-h-full">
        <TradingviewWidget
          symbol={props.symbol}
          libraryPath={props.tradingViewConfig?.library_path}
          mode={3}
          scriptSRC={props.tradingViewConfig?.scriptSRC}
          customCssUrl={props.tradingViewConfig?.customCssUrl}
        />
      </div>
      <div className="oui-relative oui-w-full">
        <div
          ref={props.dragRef}
          className={cn(
            "oui-h-[1px] oui-absolute oui-left-0 oui-right-0 oui-bottom-0 oui-top-0 oui-z-10 oui-mt-[7px] oui-bg-base-contrast-12",
            props.dragging && "oui-bg-primary "
          )}
        >
          <KlineDragIcon
            className={cn(
              "oui-w-3 oui-h-3 oui-absolute oui-left-1/2 -oui-top-[5px] -oui-translate-y-[0.5px] oui-text-base-contrast-12",
              props.dragging && " oui-text-primary"
            )}
          />
        </div>
      </div>
    </div>
  );
}
