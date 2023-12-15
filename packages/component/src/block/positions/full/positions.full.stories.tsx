import type { Meta, StoryObj } from "@storybook/react";
import { PositionsViewFull } from ".";
import { usePositionStream } from "@orderly.network/hooks";

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

export const withHook: Story = {
  render: () => {
    const [positions] = usePositionStream();
    return (
      <PositionsViewFull
        dataSource={positions?.rows ?? []}
        aggregated={positions?.aggregated}
      />
    );
  },
};
