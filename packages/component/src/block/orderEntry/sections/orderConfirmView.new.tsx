import { OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { FC, useMemo, useState } from "react";
import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { Checkbox } from "@/checkbox";
import { useDebouncedCallback, useLocalStorage } from "@orderly.network/hooks";
import { Label } from "@/label";
import Button from "@/button";
import { cn } from "@/utils";
import { useModal } from "@orderly.network/ui";
import { commify } from "@orderly.network/utils";

interface OrderConfirmViewProps {
  order: OrderEntity;
  symbol: string;
  base: string;
  quote: string;
  isTable: boolean;
}

export const OrderConfirmView: FC<OrderConfirmViewProps> = (props) => {
  const { order, quote = "USDC", base } = props;

  const type = useMemo(() => {
    const type = (type: OrderType) => {
      switch (type) {
        case OrderType.LIMIT:
          return "Limit";
        case OrderType.MARKET:
          return "Market";
        case OrderType.STOP_LIMIT:
          return "Stop Limit";
        case OrderType.STOP_MARKET:
          return "Stop Market";
      }
    };

    if (order.side === OrderSide.BUY) {
      return <Text type={"buy"}>{`${type(order.order_type)} Buy`}</Text>;
    }
    return <Text type={"sell"}>{`${type(order.order_type)} Sell`}</Text>;
  }, [order.side, order.order_type]);

  const priceNode = useMemo(() => {
    if (
      order.order_type === OrderType.MARKET ||
      order.order_type === OrderType.STOP_MARKET
    ) {
      return <span>Market</span>;
    }
    return (
      <div className="orderly-inline-block">
        <span>{commify(order.order_price || "")}</span>
        <span className="orderly-text-base-contrast-36 orderly-ml-1">
          {quote}
        </span>
      </div>
    );
  }, [order]);

  return (
    <div>
      <div className="orderly-flex orderly-items-center orderly-pb-4">
        <NetworkImage symbol={props.symbol} type="symbol" size={20} />
        <span className="orderly-text-lg orderly-pl-2">{`${base}-PERP`}</span>
      </div>
      <div className="orderly-flex orderly-text-base-contract-54 orderly-text-xs desktop:orderly-text-sm orderly-font-semibold">
        <div>
          <div className="orderly-mr-3 orderly-w-[89px] desktop:orderly-w-[140px]">
            {type}
          </div>
        </div>
        <div className="orderly-flex-1 orderly-gap-2">
          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">Qty.</span>
            <span
              className={cn(
                order.side === OrderSide.BUY
                  ? "orderly-text-trade-profit"
                  : "orderly-text-trade-loss"
              )}
            >
              {commify(order.order_quantity || "")}
            </span>
          </div>
          {order.isStopOrder === true && (
            <div className="orderly-flex orderly-justify-between orderly-mb-1">
              <span className="orderly-text-base-contrast-54">Trigger</span>
              <div className="orderly-inline-block">
                <span>{commify(order.trigger_price || "")}</span>
                <span className="orderly-text-base-contrast-36 orderly-ml-1">
                  {quote}
                </span>
              </div>
            </div>
          )}
          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">Price</span>
            {priceNode}
          </div>
          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">
              {"Est. Total"}
            </span>
            <div className="orderly-inline-block">
              <span>{commify(order.total || "")}</span>
              <span className="orderly-text-base-contrast-36 orderly-ml-1">
                {quote}
              </span>
            </div>
          </div>
        </div>
      </div>
      {props.isTable ? (
        <div className="orderly-pt-3">
          <OrderConfirmCheckBox />
        </div>
      ) : undefined}
    </div>
  );
};

export const OrderConfirmCheckBox: FC<{
  className?: string;
}> = (props) => {
  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );

  return (
    <div
      className={cn(
        "orderly-flex orderly-items-center orderly-gap-1",
        props.className
      )}
    >
      <Checkbox
        id="orderConfirm"
        checked={!needConfirm}
        onCheckedChange={(checked) => {
          setNeedConfirm(!!!checked);
        }}
      />
      <Label
        htmlFor={"orderConfirm"}
        className="orderly-text-base-contrast-54 orderly-text-3xs"
        // onClick={() => {
        //   setNeedConfirm(!needConfirm);
        // }}
      >
        Disable order confirmation
      </Label>
    </div>
  );
};

export const OrderConfirmFooter: FC<{
  onOk?: () => Promise<any>;
  onCancel?: () => Promise<any>;
}> = (props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const [loading, setLoading] = useState(false);

  const onSubmit = useDebouncedCallback(
    () => {
      setLoading(true);
      return Promise.resolve()
        .then(() => {
          if (typeof props.onOk === "function") {
            return props.onOk();
          }
          return true;
        })
        .then((data?: any) => {
          resolve(data);
          hide();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    300,
    { leading: true }
  );

  return (
    <div className="orderly-flex orderly-gap-2 orderly-px-5">
      <div className="orderly-flex-1 orderly-items-center orderly-h-[32px]">
        <OrderConfirmCheckBox className="orderly-pt-[6px]" />
      </div>
      <div className="orderly-flex-1 orderly-flex orderly-gap-3 orderly-grid-cols-2">
        <Button
          id="orderly-desktop-confirm-order-dialog-cancel"
          className="orderly-confirm-dialog-cancel-button orderly-h-[32px] orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
          key="cancel"
          type="button"
          variant="contained"
          color="tertiary"
          loading={loading}
          onClick={() => {
            return props
              .onCancel?.()
              .then(
                (data) => data,
                (reason?: any) => {
                  reject(reason);
                }
              )
              .finally(() => hide());
          }}
          fullWidth
        >
          Cancel
        </Button>

        <Button
          id="orderly-desktop-confirm-order-dialog-confirm"
          className="orderly-confirm-dialog-ok-button orderly-h-[32px] orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
          key="ok"
          type="button"
          disabled={loading}
          loading={loading}
          fullWidth
          onClick={onSubmit}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
