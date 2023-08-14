import type { Meta, StoryObj } from "@storybook/react";

import { AccountInfo } from "./accountInfo";
import React from "react";

const meta: Meta<typeof AccountInfo> = {
  //   tags: ["autodocs"],
  component: AccountInfo,
  title: "Block/AccountStatus/AccountInfo",
};

export default meta;

type Story = StoryObj<typeof AccountInfo>;

export const Default: Story = {};
