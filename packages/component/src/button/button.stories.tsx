import Button from ".";
import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedButton } from "./segmented";
import React from "react";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: "Base/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
    onClick: { action: "clicked" },
  },
};

// type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {
  args: {
    children: "Button",
    variant: "contained",
    size: "default",
  },
};

//shadow-[inset_0px_-5px_1px]
export const OrderEntryButtons = {
  render: () => {
    return (
      <div className="flex flex-row gap-3">
        <Button
          variant="contained"
          fullWidth
          className="shadow-[inset_0_-4px_1px_rgba(0,0,0,0.2)] bg-green-500 hover:bg-green-600 pb-2"
        >
          Buy
        </Button>
        <Button
          variant="contained"
          fullWidth
          className="shadow-[inset_0_-4px_1px_rgba(0,0,0,0.2)] bg-red-500 hover:bg-red-600 pb-2"
        >
          Sell
        </Button>
      </div>
    );
  },
};

export const Segmented = {
  render: () => {
    const [value, setValue] = React.useState("buy");
    return (
      <SegmentedButton
        buttons={[
          { label: "Buy", value: "buy" },
          { label: "Sell", value: "sell" },
        ]}
        onClick={(value) => {
          setValue(value);
        }}
        value={value}
      />
    );
  },
};
