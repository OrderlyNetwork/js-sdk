import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Radio, RadioGroup, SimpleRadioGroup } from ".";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  title: "Base/RadioGroup",
  argTypes: {
    onValueChange: { acton: "onValueChange" },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

// export const Default: Story = {

// };

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex gap-5">
        <RadioGroup defaultValue="1" {...args}>
          <Radio value="1">item 1</Radio>
          <Radio value="2">item 2</Radio>
          <Radio value="3">item 3</Radio>
        </RadioGroup>

        <RadioGroup
          defaultValue="2"
          className="flex flex-row gap-5"
          orientation="horizontal"
          {...args}
        >
          <Radio value="1">item 1</Radio>
          <Radio value="2">item 2</Radio>
          <Radio value="3">item 3</Radio>
        </RadioGroup>
      </div>
    );
  },
};
