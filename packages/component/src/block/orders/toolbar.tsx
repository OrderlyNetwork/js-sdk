import Button from "@/button";
import { FC } from "react";
import { SidePicker } from "@/block/pickers";
import { Label } from "@/label";
import { Checkbox } from "@/checkbox";
import { useOrderStream } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";

interface Props {
  onCancelAll?: () => Promise<void>;
  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
  isStopOrder?: boolean;
}

export const Toolbar: FC<Props> = (props) => {
  // const [cancelAll, { error: cancelOrderError, isMutating: cancelMutating }] =
  //   useMutation("/v1/orders", "DELETE");

  function cancelAllOrder() {
    modal
      .confirm({
        title: "Cancel all orders",
        content: (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
            {props.isStopOrder
              ? "Are you sure you want to cancel all of your TP/SL orders?"
              : "Are you sure you want to cancel all of your pending order?"}
          </div>
        ),
        contentClassName: "desktop:orderly-w-[364px]",
        onOk: async () => {
          // do cancel all orders
          try {
            await props.onCancelAll?.();
          } catch (error) {
            // @ts-ignore
            if (error?.message !== undefined) {
              // @ts-ignore
              toast.error(error.message);
            }
          } finally {
            Promise.resolve();
          }
        },
        onCancel: () => {
          return Promise.reject();
        },
      })
      .catch((error) => {});
  }

  return (
    <div className="orderly-data-list-filter orderly-flex orderly-justify-between orderly-items-center orderly-py-3 orderly-px-4">
      <div className="orderly-flex orderly-items-center orderly-gap-1">
        <Checkbox
          id={"showAll"}
          checked={props.showAllSymbol}
          onCheckedChange={props.onShowAllSymbolChange}
        />
        <Label htmlFor={"showAll"} className="orderly-text-base-contrast-54">
          Show all instruments
        </Label>
      </div>
      <Button
        variant={"outlined"}
        size={"small"}
        color={"tertiary"}
        onClick={cancelAllOrder}
        className="orderly-text-3xs orderly-text-base-contrast-36"
      >
        Cancel all
      </Button>
    </div>
  );
};
