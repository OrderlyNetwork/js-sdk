import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Portfolio } from ".";

const meta: Meta = {
  title: "Page/Portfolio",
  component: Portfolio,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
};

export default meta;

export const Default: StoryObj = {
  render: (args) => {
    return <Portfolio {...args} />;
  },
};
