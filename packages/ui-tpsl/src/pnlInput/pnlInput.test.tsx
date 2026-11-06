import mockReact from "react";
import { act, create } from "react-test-renderer";
import { PNLInput } from "./pnlInput.ui";
import { PnlInputWidget } from "./pnlInput.widget";
import { PnLMode } from "./useBuilder.script";

jest.mock("@orderly.network/hooks", () => ({
  useLocalStorage: (_: string, initial: string) => mockReact.useState(initial),
}));
jest.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@orderly.network/ui", () => ({
  CaretDownIcon: () => null,
  Input: (props: any) =>
    mockReact.createElement("input-control", props, props.suffix),
  SimpleDropdownMenu: (props: any) =>
    mockReact.createElement("dropdown-menu", props, props.children),
  Text: (props: any) => mockReact.createElement("text", props, props.children),
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
  inputFormatter: {
    currencyFormatter: {},
    decimalPointFormatter: {},
  },
}));

describe("PNLInput", () => {
  it.each([
    { type: "TP", expectedPnl: "1.23" },
    { type: "SL", expectedPnl: "-1.23" },
  ] as const)(
    "formats $type amount offsets at symbol precision and keeps percentage and PnL at two decimals",
    ({ type, expectedPnl }) => {
      const onChange = jest.fn();
      const tree = create(
        <PnlInputWidget
          type={type}
          quote="USDC"
          quote_dp={8}
          onChange={onChange}
          values={{
            PnL: "10",
            Offset: "0.0005",
            "Offset%": "0.1",
            OffsetFromMark: "-1e-8",
            PercentageFromMark: "0.1",
          }}
        />,
      );
      const input = () => tree.root.findByType("input-control" as any);
      const formatter = () => input().props.formatters[0];
      const select = (value: PnLMode) => {
        act(() =>
          tree.root
            .findByType("dropdown-menu" as any)
            .props.onSelect({ value }),
        );
      };
      const options = { isFocused: false };

      select(PnLMode.OFFSET);
      expect(formatter().onRenderBefore(input().props.value, options)).toBe(
        "0.0005",
      );
      expect(formatter().onSendBefore("0.00050001", options)).toBe(
        "0.00050001",
      );

      select(PnLMode.OFFSET_FROM_MARK);
      const rendered = formatter().onRenderBefore(input().props.value, options);
      expect(rendered).toBe("-0.00000001");
      expect(formatter().onSendBefore(rendered, options)).toBe(rendered);

      select(PnLMode.PERCENTAGE);
      expect(formatter().onSendBefore("1.2345", options)).toBe("0.0123");

      select(PnLMode.PnL);
      const pnl = formatter().onSendBefore("1.2345", { isFocused: true });
      expect(pnl).toBe(expectedPnl);
      act(() => input().props.onValueChange(pnl));
      expect(onChange).toHaveBeenCalledWith(
        `${type.toLowerCase()}_pnl`,
        expectedPnl,
      );
      tree.unmount();
    },
  );

  it("keeps locked offsets read-only while permitting selection and editing of PnL", () => {
    const onChange = jest.fn();
    const tree = create(
      <PnlInputWidget
        offsetReadOnly
        type="TP"
        quote="USDC"
        onChange={onChange}
        values={{
          PnL: "10",
          Offset: "100",
          "Offset%": "0.1",
          OffsetFromMark: "100",
          PercentageFromMark: "0.1",
        }}
      />,
    );

    const input = () => tree.root.findByType("input-control" as any);
    expect(input().props.readOnly).toBe(true);
    act(() => input().props.onValueChange("0.2"));
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      tree.root
        .findByType("dropdown-menu" as any)
        .props.onSelect({ value: PnLMode.PnL });
    });
    expect(input().props.readOnly).toBe(false);
    act(() => input().props.onValueChange("20"));
    expect(onChange).toHaveBeenCalledWith("tp_pnl", "20");
    tree.unmount();
  });

  it("disables both value and mode editing", () => {
    const onModeChange = jest.fn();
    const renderInput = (disabled: boolean) => (
      <PNLInput
        {...({
          disabled,
          mode: PnLMode.PERCENTAGE,
          modes: [
            { label: "Offset%", value: PnLMode.PERCENTAGE },
            { label: "PnL", value: PnLMode.PnL },
          ],
          modeLabelMap: {
            [PnLMode.PERCENTAGE]: "Offset",
          },
          onModeChange,
          onValueChange: jest.fn(),
          quote: "USDC",
          quote_dp: 2,
          value: "0.1",
          pnl: "100",
          formatter: () => ({}),
          setFocus: jest.fn(),
        } as any)}
      />
    );
    const tree = create(renderInput(true));

    expect(tree.root.findByType("input-control" as any).props.disabled).toBe(
      true,
    );
    expect(tree.root.findByType("button").props.disabled).toBe(true);
    expect(tree.root.findAllByType("dropdown-menu" as any)).toHaveLength(0);
    expect(onModeChange).not.toHaveBeenCalled();

    act(() => tree.update(renderInput(false)));

    act(() => {
      tree.root
        .findByType("dropdown-menu" as any)
        .props.onSelect({ label: "PnL", value: PnLMode.PnL });
    });
    expect(onModeChange).toHaveBeenCalledWith(PnLMode.PnL);

    act(() => tree.update(renderInput(true)));
    expect(tree.root.findAllByType("dropdown-menu" as any)).toHaveLength(0);
    expect(tree.root.findByType("button").props.disabled).toBe(true);
    tree.unmount();
  });
});
