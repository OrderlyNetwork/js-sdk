import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Radio, RadioGroup, SimpleRadioGroup } from ".";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  title: "Base/RadioGroup",
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {},
};

export const Simple: Story = {
  render: () => {
    return (
      <RadioGroup
        defaultValue="1"
        onChange={(event) => {
          console.log(event);
        }}
        onValueChange={(value) => {
          console.log(value);
        }}
      >
        <Radio value="1">item 1</Radio>
        <Radio value="2">item 2</Radio>
      </RadioGroup>
    );
  },
};
