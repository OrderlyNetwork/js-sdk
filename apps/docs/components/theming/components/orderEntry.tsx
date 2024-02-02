import { OrderEntry } from "@orderly.network/react";
import { useAccount, useOrderEntry } from "@orderly.network/hooks";
import { AccountStatusEnum, OrderSide } from "@orderly.network/types";
import { useState } from "react";
import { useDemoContext } from "@/components/demoContext";

export const OrderEntryComponent = () => {
  const { state } = useAccount();
  const { symbol } = useDemoContext();

  const [side, setSide] = useState(OrderSide.BUY);
  // const [reduceOnly, setReduceOnly] = useState(false);
  const formState = useOrderEntry(symbol, side, {
    reduce_only: false,
  });

  return (
    <div className="py-5">
      <OrderEntry
        {...formState}
        showConfirm
        side={side}
        onSideChange={setSide}
        symbol={symbol}
        onFieldChange={(field, value) => {
          console.log(field, value);
        }}
        // onReduceOnlyChange={setReduceOnly}
        disabled={state.status < AccountStatusEnum.EnableTrading}
      />
    </div>
  );
};
