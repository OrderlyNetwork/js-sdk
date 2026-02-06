import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, DatePicker } from "@orderly.network/ui";

const meta = {
  title: "Base/Picker/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date>();
    return (
      <DatePicker
        value={value}
        onChange={(date) => setValue(date)}
        className="oui-w-60 oui-border-none"
      />
    );
  },
};

export const SingleWithChildren: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date>();
    return (
      <DatePicker value={value} onChange={(date) => setValue(date)}>
        <Button>Select Date</Button>
      </DatePicker>
    );
  },
};

export const Range: Story = {
  render: (args) => {
    return <DatePicker.range />;
  },
};
