import type { Meta, StoryObj } from "@storybook/react";

import { AssetAndMarginSheet } from "./sections/assetAndMargin";
import React from "react";

const meta: Meta<typeof AssetAndMarginSheet> = {
  //   tags: ["autodocs"],
  component: AssetAndMarginSheet,
  title: "Block/AccountStatus/AssetAndMargin",
};

export default meta;

type Story = StoryObj<typeof AssetAndMarginSheet>;

export const Default: Story = {};
