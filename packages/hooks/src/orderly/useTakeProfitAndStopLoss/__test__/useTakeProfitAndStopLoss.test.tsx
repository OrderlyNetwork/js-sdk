import { act, renderHook } from "@testing-library/react-hooks";
import { useTaskProfitAndStopLoss } from "..";

describe("useTakeProfitAndStopLoss hook test", () => {
  test("should return the correct initial values", async () => {
    const { result, waitFor } = renderHook(
      () => {
        return useTaskProfitAndStopLoss({
          symbol: "PERP_ETH_USDC",
        });
      },
      {
        // wrapper,
      }
    );

    expect(result.current[0].symbol).toBe("PERP_ETH_USDC");
    expect(result.current[1].error).toBe(null);
    expect(typeof result.current[1].submit).toBe("function");
  });
});

describe("test util functions", () => {});
