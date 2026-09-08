import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { MarginMode, OrderSide, PositionType } from "@orderly.network/types";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

let mockMarginMode: MarginMode | undefined;
let mockPositions: any[] = [];
const mockClose = jest.fn();
const mockSetValue = jest.fn();
const mockSetValues = jest.fn();
const mockUseTPSLOrder = jest.fn(() => [
  {
    side: OrderSide.BUY,
    quantity: 0,
  },
  {
    submit: jest.fn(),
    deleteOrder: jest.fn(),
    setValue: mockSetValue,
    setValues: mockSetValues,
    validate: jest.fn(),
    metaState: {},
    errors: {},
    isCreateMutating: false,
    isUpdateMutating: false,
  },
]);

jest.mock("@orderly.network/hooks", () => ({
  ERROR_MSG_CODES: { SL_PRICE_WARNING: "SL_PRICE_WARNING" },
  useAccount: () => ({ state: { mainAccountId: "main-account" } }),
  useEstLiqPriceBySymbol: () => undefined,
  useEventEmitter: () => ({ emit: jest.fn() }),
  useLocalStorage: () => [false],
  useMarginModeBySymbol: () => ({ marginMode: mockMarginMode }),
  useMemoizedFn: (fn: unknown) => fn,
  usePositionStream: () => [{ rows: mockPositions }],
  useSymbolsInfo: () => ({ PERP_ETH_USDC: jest.fn() }),
  useTPSLOrder: (...args: unknown[]) => mockUseTPSLOrder(...args),
  useTpslPriceChecker: () => null,
  utils: {
    findTPSLFromOrder: jest.fn(() => ({})),
    findTPSLOrderPriceFromOrder: jest.fn(() => ({})),
  },
}));

jest.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@orderly.network/ui", () => ({
  modal: { confirm: jest.fn() },
  toast: { error: jest.fn() },
}));

jest.mock("./positionTpslConfirm", () => ({
  PositionTPSLConfirm: () => null,
}));

jest.mock("./tpslOrderSync", () => ({
  getChangedTPSLEditableOrderValues: jest.fn(() => ({})),
  getTPSLEditableOrderValues: jest.fn(() => ({})),
}));

const isolatedPosition = {
  symbol: "PERP_ETH_USDC",
  margin_mode: MarginMode.ISOLATED,
  position_qty: 2,
  average_open_price: 4000,
};
const crossPosition = {
  symbol: "PERP_ETH_USDC",
  margin_mode: MarginMode.CROSS,
  position_qty: 3,
  average_open_price: 3900,
};

let latestResult: ReturnType<typeof useTPSLBuilder>;

const HookProbe = ({ options }: { options: TPSLBuilderOptions }) => {
  latestResult = useTPSLBuilder(options);
  return null;
};

const renderBuilder = (options: Partial<TPSLBuilderOptions> = {}) => {
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(
      <HookProbe
        options={{
          symbol: "PERP_ETH_USDC",
          positionType: PositionType.FULL,
          close: mockClose,
          ...options,
        }}
      />,
    );
  });
  return {
    result: latestResult!,
    unmount: () => act(() => renderer!.unmount()),
  };
};

describe("useTPSLBuilder position selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarginMode = MarginMode.ISOLATED;
    mockPositions = [isolatedPosition, crossPosition];
  });

  it("selects the current Isolated position when position is omitted", () => {
    const view = renderBuilder();

    expect(view.result.position).toBe(isolatedPosition);
    expect(mockClose).not.toHaveBeenCalled();
    expect(mockUseTPSLOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        position_qty: 2,
        average_open_price: 4000,
        margin_mode: MarginMode.ISOLATED,
      }),
      expect.any(Object),
    );

    view.unmount();
  });

  it("does not close when the account only has an Isolated position", () => {
    mockPositions = [isolatedPosition];

    const view = renderBuilder();

    expect(view.result.position).toBe(isolatedPosition);
    expect(mockClose).not.toHaveBeenCalled();
    view.unmount();
  });

  it("prefers the edited order margin mode over position and symbol modes", () => {
    const view = renderBuilder({
      order: {
        symbol: "PERP_ETH_USDC",
        margin_mode: MarginMode.CROSS,
      } as any,
      position: isolatedPosition as any,
    });

    expect(view.result.position).toBe(crossPosition);
    view.unmount();
  });

  it("prefers the explicit position margin mode over the symbol mode", () => {
    const view = renderBuilder({ position: crossPosition as any });

    expect(view.result.position).toBe(crossPosition);
    view.unmount();
  });

  it("falls back to Cross when no margin mode is available", () => {
    mockMarginMode = undefined;
    const view = renderBuilder();

    expect(view.result.position).toBe(crossPosition);
    view.unmount();
  });

  it("keeps an explicit sub-account position", () => {
    const subAccountPosition = {
      ...isolatedPosition,
      account_id: "sub-account",
      position_qty: 4,
    };
    const view = renderBuilder({ position: subAccountPosition as any });

    expect(view.result.position).toBe(subAccountPosition);
    expect(mockClose).not.toHaveBeenCalled();
    view.unmount();
  });
});
