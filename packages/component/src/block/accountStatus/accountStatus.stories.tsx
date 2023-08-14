import type { Meta, StoryObj } from "@storybook/react";

import { AccountStatus } from ".";
import React from "react";

const meta: Meta<typeof AccountStatus> = {
  //   tags: ["autodocs"],
  component: AccountStatus,
  title: "Block/AccountStatus/BottomBar",
};

export default meta;

type Story = StoryObj<typeof AccountStatus>;

export const Default: Story = {};
