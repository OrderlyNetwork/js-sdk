import { OrderEntity } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";

export const editOrderConfirmContent = (
  data: OrderEntity,
  dirtyFields: Partial<OrderEntity>,
  base: string
) => {
  let confirmText;

  if (dirtyFields["order_price"] && dirtyFields["order_quantity"]) {
    confirmText = (
      <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
        You agree changing the price of {base}-PERP order to{" "}
        <span className="orderly-text-warning">
          {commify(data.order_price!)}
        </span>{" "}
        and the quantity to{" "}
        <span className="orderly-text-warning">
          {commify(data.order_quantity!)}
        </span>
        .
      </div>
    );
  } else {
    if (dirtyFields["order_price"]) {
      confirmText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          You agree changing the price of {base}-PERP order to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_price!)}
          </span>
          .
        </div>
      );
    }

    if (dirtyFields["order_quantity"]) {
      confirmText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
          You agree changing the quantity of {base}-PERP order to{" "}
          <span className="orderly-text-warning">
            {commify(data.order_quantity!)}
          </span>
          .
        </div>
      );
    }
  }

  return confirmText;
};
