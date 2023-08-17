import type { Meta, StoryObj } from "@storybook/react";

import { AccountStatus } from ".";
import React from "react";

const meta: Meta<typeof AccountStatus> = {
  //   tags: ["autodocs"],
  component: AccountStatus,
  title: "Block/AccountStatus/BottomBar",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof AccountStatus>;

export const Default: Story = {
  render: () => {
    return (
      <div className="'h-screen">
        <div className="fiexed left-0 bottom-0">
          <AccountStatus />
        </div>
      </div>
    );
  },
};
