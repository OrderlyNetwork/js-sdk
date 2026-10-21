import { act } from "react";
import { createRoot } from "react-dom/client";
import { useOrderStream } from "@orderly.network/hooks";
import useBroker from "./useBroker";

jest.mock("@orderly.network/hooks", () => ({
  useOrderStream: jest.fn(),
  useEventEmitter: jest.fn(),
  useSymbolsInfo: jest.fn(),
}));

jest.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
}));

jest.mock("./useCancelOrder", () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock("./useSendOrder", () => ({
  __esModule: true,
  default: () => ({
    sendMarketOrder: jest.fn(),
    sendLimitOrder: jest.fn(),
  }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockUseOrderStream = jest.mocked(useOrderStream);
const oldTP = {
  algo_order_id: 11,
  root_algo_order_id: 10,
  parent_algo_order_id: 10,
  root_algo_order_algo_type: "TP_SL",
  algo_type: "TAKE_PROFIT",
};
const newTP = {
  ...oldTP,
  algo_order_id: 21,
  root_algo_order_id: 20,
  parent_algo_order_id: 20,
};
const lineValue = { type: "trigger_price", value: "2556.250" };

describe("TradingView broker order editing", () => {
  let root: ReturnType<typeof createRoot>;
  let broker: ReturnType<typeof useBroker>;
  const onToast = { error: jest.fn() };
  const updateOrder = jest.fn();
  const updateAlgoOrder = jest.fn();

  function setUpdateTPSLOrder(updateTPSLOrder: jest.Mock) {
    mockUseOrderStream.mockReturnValue([
      [],
      { updateOrder, updateAlgoOrder, updateTPSLOrder },
    ] as unknown as ReturnType<typeof useOrderStream>);
  }

  function Harness() {
    broker = useBroker({
      closeConfirm: undefined,
      colorConfig: {},
      onToast,
      symbol: "PERP_ETH_USDC",
    });
    return null;
  }

  function render() {
    act(() => root.render(<Harness />));
  }

  beforeEach(() => {
    jest.clearAllMocks();
    root = createRoot(document.createElement("div"));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  it("edits a TP present at initialization with its parent and child IDs", async () => {
    const updateTPSLOrder = jest.fn().mockResolvedValue({ success: true });
    setUpdateTPSLOrder(updateTPSLOrder);
    render();

    await broker.editOrder(oldTP, lineValue);

    expect(updateTPSLOrder).toHaveBeenCalledWith(10, [
      { order_id: 11, trigger_price: "2556.25" },
    ]);
    expect(onToast.error).not.toHaveBeenCalled();
  });

  it("edits a newly added TP through the original broker reference", async () => {
    const initialUpdate = jest
      .fn()
      .mockRejectedValue(
        new Error("A parent TP/SL order is required for child updates"),
      );
    setUpdateTPSLOrder(initialUpdate);
    render();
    const chartBroker = broker;

    const latestUpdate = jest.fn().mockResolvedValue({ success: true });
    setUpdateTPSLOrder(latestUpdate);
    render();
    await chartBroker.editOrder(newTP, lineValue);

    expect(broker).toBe(chartBroker);
    expect(latestUpdate).toHaveBeenCalledWith(20, [
      { order_id: 21, trigger_price: "2556.25" },
    ]);
    expect(initialUpdate).not.toHaveBeenCalled();
    expect(onToast.error).not.toHaveBeenCalled();
  });

  it("uses the new order snapshot after old orders are cleared and replaced", async () => {
    const initialUpdate = jest.fn().mockResolvedValue({ success: true });
    setUpdateTPSLOrder(initialUpdate);
    render();
    const chartBroker = broker;
    await chartBroker.editOrder(oldTP, lineValue);

    const emptyUpdate = jest
      .fn()
      .mockRejectedValue(
        new Error("A parent TP/SL order is required for child updates"),
      );
    setUpdateTPSLOrder(emptyUpdate);
    render();

    const latestUpdate = jest.fn().mockResolvedValue({ success: true });
    setUpdateTPSLOrder(latestUpdate);
    render();
    await chartBroker.editOrder(newTP, lineValue);

    expect(broker).toBe(chartBroker);
    expect(initialUpdate).toHaveBeenCalledTimes(1);
    expect(emptyUpdate).not.toHaveBeenCalled();
    expect(latestUpdate).toHaveBeenCalledWith(20, [
      { order_id: 21, trigger_price: "2556.25" },
    ]);
    expect(onToast.error).not.toHaveBeenCalled();
  });

  it("shows an error when the latest update rejects", async () => {
    const initialUpdate = jest.fn().mockResolvedValue({ success: true });
    setUpdateTPSLOrder(initialUpdate);
    render();
    const chartBroker = broker;

    const latestUpdate = jest
      .fn()
      .mockRejectedValue(new Error("Invalid TP/SL price"));
    setUpdateTPSLOrder(latestUpdate);
    render();
    await chartBroker.editOrder(newTP, lineValue);

    expect(latestUpdate).toHaveBeenCalledWith(20, [
      { order_id: 21, trigger_price: "2556.25" },
    ]);
    expect(initialUpdate).not.toHaveBeenCalled();
    expect(onToast.error).toHaveBeenCalledTimes(1);
    expect(onToast.error).toHaveBeenCalledWith("Invalid TP/SL price");
  });
});
