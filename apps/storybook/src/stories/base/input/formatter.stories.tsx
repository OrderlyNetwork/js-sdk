import { useState } from "react";
import { Input, inputFormatter } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import type { StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

const meta = {
  title: "Base/Input/formatter",
  component: Input,
  parameters: {
    layout: "centered",
  },
  // tags: ["autodocs"],
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["default", "success", "danger", "warning"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    fullWidth: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    size: "default",
    disabled: false,
    fullWidth: false,
    placeholder: "text",
    onValueChange: fn(),
    onClear: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Formatter: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        className="oui-w-60"
        data-testid="Only input number"
        value={value}
        placeholder="Only input number"
        onValueChange={(val) => {
          console.log(val);
          setValue(val);
        }}
      />
    );
  },
  args: {
    formatters: [
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    userEvent.type(canvas.getByTestId("Only input number"), "1234567890");
  },
};

export const DPFormatter: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        className="oui-w-60"
        data-testid="Only input number"
        value={value}
        placeholder="Only input number"
        onValueChange={(val) => {
          setValue(val);
        }}
      />
    );
  },
  args: {
    formatters: [
      // inputFormatter.numberFormatter,
      inputFormatter.dpFormatter(2, {
        roundingMode: Decimal.ROUND_FLOOR,
      }),
      inputFormatter.currencyFormatter,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    userEvent.type(canvas.getByTestId("Only input number"), "1234567890.2365");
  },
};

export const RoundupFormatter: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        className="oui-w-60"
        data-testid="Only input number"
        value={value}
        placeholder="Only input number"
        onValueChange={(val) => {
          setValue(val);
        }}
      />
    );
  },
  args: {
    formatters: [
      // inputFormatter.numberFormatter,
      inputFormatter.dpFormatter(2, {
        roundingMode: Decimal.ROUND_UP,
      }),
      inputFormatter.currencyFormatter,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    userEvent.type(canvas.getByTestId("Only input number"), "1234567890.2365");
  },
};
