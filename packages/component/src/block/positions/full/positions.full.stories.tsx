import type { Meta, StoryObj } from "@storybook/react";
import { PositionsViewFull } from ".";

const meta: Meta<typeof PositionsViewFull> = {
  component: PositionsViewFull,
  title: "Block/Positions/web",
};

export default meta;
type Story = StoryObj<typeof PositionsViewFull>;

export const Default: Story = {
  args: {
    dataSource: [],
  },
};
