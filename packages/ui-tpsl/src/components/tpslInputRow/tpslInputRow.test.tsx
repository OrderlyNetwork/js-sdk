import mockReact from "react";
import { act, create } from "react-test-renderer";
import { OrderType, PositionType } from "@orderly.network/types";
import { TPSLInputRowUI } from "./tpslInputRow.ui";

jest.mock("@orderly.network/hooks", () => ({}));
jest.mock("@orderly.network/react-app", () => ({
  useOrderEntryFormErrorMsg: () => ({ getErrorMsg: () => undefined }),
}));
jest.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ components }: any) => <>{components}</>,
}));
jest.mock("@orderly.network/ui", () => {
  const box = ({ children }: any) =>
    mockReact.createElement("div", null, children);
  box.numeral = ({ children }: any) =>
    mockReact.createElement("numeral", null, children);
  return {
    Flex: box,
    Text: box,
    Grid: box,
    cn: (...args: any[]) => args.filter(Boolean).join(" "),
  };
});
jest.mock("../../pnlInput/pnlInput.widget", () => ({
  PnlInputWidget: () => null,
}));
jest.mock("../orderPriceType", () => ({
  OrderPriceType: (props: any) => mockReact.createElement("order-type", props),
}));
jest.mock("./priceInput", () => ({
  PriceInput: (props: any) => mockReact.createElement("price-input", props),
}));

const props: any = {
  type: "tp",
  quote_dp: 2,
  positionType: PositionType.FULL,
  values: {
    trigger_price: "4100",
    order_price: "4110",
    order_type: OrderType.LIMIT,
    PnL: "110",
  },
  errors: null,
  roi: 10,
  onChange: jest.fn(),
};

describe("Full-position TP/SL row", () => {
  it.each(["tp", "sl"])(
    "enables independent %s Limit input and type selection",
    (type) => {
      const tree = create(<TPSLInputRowUI {...props} type={type} />);
      const inputs = tree.root.findAllByType("price-input" as any);
      expect(inputs[1].props.disabled).toBe(false);
      expect(
        tree.root.findByType("order-type" as any).props.disabled,
      ).toBeFalsy();
      act(() => inputs[1].props.onValueChange("4120"));
      expect(props.onChange).toHaveBeenCalledWith(
        `${type}_order_price`,
        "4120",
      );
      tree.unmount();
    },
  );
  it("locks only type while editing a server Limit leg", () => {
    const tree = create(<TPSLInputRowUI {...props} disableOrderTypeSelector />);
    expect(tree.root.findByType("order-type" as any).props.disabled).toBe(true);
    expect(
      tree.root.findAllByType("price-input" as any)[1].props.disabled,
    ).toBe(false);
    tree.unmount();
  });
  it("keeps Market order price disabled but permits changing new order type", () => {
    const tree = create(
      <TPSLInputRowUI
        {...props}
        values={{ ...props.values, order_type: OrderType.MARKET }}
      />,
    );
    expect(
      tree.root.findAllByType("price-input" as any)[1].props.disabled,
    ).toBe(true);
    expect(
      tree.root.findByType("order-type" as any).props.disabled,
    ).toBeFalsy();
    tree.unmount();
  });
  it("keeps trigger wording independent of the Limit price used for PnL", () => {
    const tree = create(<TPSLInputRowUI {...props} />);
    const numbers = tree.root
      .findAllByType("numeral" as any)
      .map((node) => node.props.children);
    expect(numbers).toEqual(["4100", "110", 10]);
    tree.unmount();
  });
});
