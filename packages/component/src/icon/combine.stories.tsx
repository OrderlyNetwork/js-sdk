import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Combine } from "./combine";

const meta: Meta<typeof Combine> = {
  component: Combine,
  title: "Base/Image/Combine",
  //   tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Combine>;

export const Default: Story = {
  args: {
    main: {
      name: "BTC",
      type: "token",
      size: "large",
    },
    sub: {
      name: "NEAR",
      type: "token",
      size: "small",
    },
  },
};
