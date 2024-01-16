import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { HoverCard } from "./hoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Base/HoverCard",
  component: HoverCard,
};

export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => {
    return (
      <HoverCard content={<div>Hover card content</div>}>
        <button>Hover Card</button>
      </HoverCard>
    );
  },
};
