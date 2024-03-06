import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { TPForm } from "./tpAndslForm";

const meta: Meta = {
  title: "Block/TP&SL Form",
  component: TPForm,
  args: {},
};

export default meta;

type Story = StoryObj<typeof TPForm>;

export const Default: Story = {};
