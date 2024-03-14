import { act, renderHook } from "@testing-library/react";
import { useTaskProfitAndStopLossInternal } from "../useTPSL";

describe("useTakeProfitAndStopLoss hook test", () => {
  test("should return the correct initial values", async () => {
    const { result } = renderHook(
      () => {
        return useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
          },
          73000
        );
      },
      {
        // wrapper,
      }
    );

    expect(result.current[0].symbol).toBe("PERP_ETH_USDC");
    expect(result.current[1].error).toBe(null);
    expect(typeof result.current[1].submit).toBe("function");
  });

  test("should update the order correctly", async () => {
    const { result } = renderHook(
      () => {
        return useTaskProfitAndStopLossInternal(
          {
            symbol: "PERP_ETH_USDC",
          },
          73000
        );
      },
      {
        // wrapper,
      }
    );

    act(() => {
      result.current[1].updateOrder("tp_trigger_price", 75000);
    });

    expect(result.current[0].tp_trigger_price).toBe(75000);
    expect(result.current[0].tp_offset).toBe(75000 - 73000);

    expect(result.current[0].tp_offset_percentage).toBe(
      (75000 - 73000) / 73000
    );
    expect(result.current[0].tp_pnl).toBe(75000 - 73000);

    expect(result.current[0].sl_pnl).toBeUndefined();
  });
});
