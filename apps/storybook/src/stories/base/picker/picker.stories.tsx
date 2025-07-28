import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// import { fn } from 'storybook/test';
import {
  ActionSheet,
  ActionSheetItem,
  BaseActionSheetItem,
  Button,
  DatePicker,
  Picker,
} from "@orderly.network/ui";

const meta = {
  title: "Base/Picker/Picker",
  component: DatePicker,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [sel, setSel] = useState("A");
    return (
      <>
        <Picker
          value={sel}
          size="sm"
          options={["A", "B", "C"].map((item) => ({
            label: `${item}`,
            value: `${item}`,
          }))}
          className="oui-min-w-[80px]"
          onValueChange={(value) => {
            setSel(value);
          }}
        />
      </>
    );
  },
};
