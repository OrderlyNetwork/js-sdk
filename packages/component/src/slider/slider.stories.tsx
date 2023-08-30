import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Slider } from ".";

const meta: Meta<typeof Slider> = {
  tags: ["autodocs"],
  component: Slider,
  title: "Base/Slider",
  argTypes: {
    // onValueChange: { action: "onValueChange" },
    onValueCommit: { action: "onValueCommit" },
  },

  parameters: {
    // layout
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "50px 0px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: [50],
  },
};

export const Step: Story = {
  args: {
    step: 25,
  },
};

export const Marks: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.defaultValue);
    return <Slider {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    marks: [
      { value: 0, label: "0" },
      { value: 25, label: "25" },
      { value: 50, label: "50" },
      { value: 75, label: "75" },
      { value: 100, label: "100" },
    ],
  },
};
