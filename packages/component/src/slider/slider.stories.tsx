import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Slider } from ".";

const meta: Meta<typeof Slider> = {
  tags: ["autodocs"],
  component: Slider,
  title: "Base/Slider",
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

export const Step: Story = {
  args: {
    step: 10,
  },
};
