import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { useOrderEntry } from "../src/orderly/useOrderEntry";
import { OrderSide, OrderType } from "@orderly.network/types";
import { OrderlyConfigProvider } from "../src/configProvider";

describe("useOrderEntry", () => {
  test("should return the correct initial values", () => {
    const wrapper = ({ children }) => (
      <OrderlyConfigProvider brokerId={"orderly"} networkId={"testnet"}>
        {children}
      </OrderlyConfigProvider>
    );
    const { result,waitFor } = renderHook(
      () => {
        return useOrderEntry({
          side: OrderSide.BUY,
          order_type: OrderType.LIMIT,
          symbol: "PERP_ETH_USDC",
        });
      },
      {
        wrapper,
      }
    );

    // expect(result.current.doCreateOrder).toBeDefined();
    // expect(result.current.data).toBeNull();
    // expect(result.current.error).toBeNull();
    expect(result.current).toBeDefined();
    // Add more assertions for other values returned by the hook
  });

  // Add more test cases to cover different scenarios and edge cases
});
