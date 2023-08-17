// @ts-ignore
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { BottomSheet } from ".";
import { useState } from "react";
import Button from "../button";
import { modal } from "../modal";
import { OrderlyProvider } from "../provider/orderlyProvider";

const meta: Meta<typeof BottomSheet> = {
  title: "Base/BottomSheet",
  component: BottomSheet,
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  args: {
    title: "Bottom Sheet",
    children: "Bottom Sheet Content",
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button size={"small"} onClick={() => setIsOpen(true)}>
          Open
        </Button>
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Controlled Bottom Sheet"
        />
      </div>
    );
  },
};

export const WithCommandStyle: Story = {
  render: (args) => {
    return (
      <>
        <Button
          size={"small"}
          onClick={() => {
            modal.actionSheet([
              { label: "itme1" },
              { label: "itme2" },
              { label: "item3" },
              "---",
              "Cancel",
            ]);
          }}
        >
          actionsheet
        </Button>
      </>
    );
  },
};
