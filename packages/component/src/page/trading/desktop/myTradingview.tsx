import { TradingView } from "@orderly.network/trading-view";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { useEffect, useMemo, useState } from "react";
import { SymbolProvider, useSymbolContext } from "@/provider/symbolProvider";
import { toast } from "@/toast";
import { useOrderEntry, useSymbolsInfo } from "@orderly.network/hooks";
import { CloseBaseConfirm } from "@/block/positions/full/marketConfirmDialog";
import { OrderSide, OrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { Spinner } from "@/spinner";

interface Props {
  symbol: string;
  tradingViewConfig?: {
    scriptSRC?: string;
    library_path: string;
    overrides?: Record<string, string>;
    customCssUrl?: string;
  };
}

export const MyTradingView = ({ symbol, tradingViewConfig }: Props) => {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const { helper, onSubmit, submitting } = useOrderEntry(symbol, side, true);
  const symbolInfo = useSymbolsInfo()[symbol];
  const [orderData, setOrderData] = useState<any>();

  const closePositionConfirmCallback = (data: any) => {
    const side = new Decimal(data.balance).greaterThan(0)
      ? OrderSide.SELL
      : OrderSide.BUY;
    const order: any = {
      //   order_price: undefined,
      order_quantity: data.balance,
      symbol: symbol,
      order_type: OrderType.MARKET,
      side,
      reduce_only: true,
    };
    setOrderData(order);
    setSide(side);
    setOpen(true);
  };

  const onConfirm = async () => {
    console.log("-- order data", orderData);
    return onSubmit(orderData).then(
      (res) => {
        setOpen(false);
      },
      (error: Error) => {
        toast.error(error.message);
      }
    );
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <SymbolProvider symbol={symbol}>
        <TradingView
          symbol={symbol}
          libraryPath={tradingViewConfig?.library_path}
          tradingViewScriptSrc={tradingViewConfig?.scriptSRC}
          tradingViewCustomCssUrl={tradingViewConfig?.customCssUrl}
          overrides={tradingViewConfig?.overrides}
          closePositionConfirmCallback={closePositionConfirmCallback}
          onToast={toast}
          loadingElement={<Spinner />}
        />
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <div
              style={{
                position: "absolute",
                width: "0",
                height: "0",
                left: "50%",
                top: "50%",
              }}
            ></div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            className="orderly-w-[340px]"
          >
            <CloseBaseConfirm
              base={symbolInfo("base")}
              quantity={orderData?.order_quantity ?? 0}
              onClose={onClose}
              onConfirm={onConfirm}
              submitting={submitting}
            />
          </PopoverContent>
        </Popover>
      </SymbolProvider>
    </div>
  );
};
