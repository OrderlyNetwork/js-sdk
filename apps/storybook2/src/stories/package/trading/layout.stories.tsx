import type { Meta, StoryObj } from "@storybook/react";
import { SplitLayout } from "@orderly.network/trading";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof SplitLayout> = {
  title: "Package/Trading/SplitLayout",
  component: SplitLayout,
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Split: Story = {
  render: (args) => {
    return (
      <Box>
        <SplitLayout
          style={{
            height: 100,
          }}
          lineBar
        >
          <Box intensity={500} style={{ minWidth: 360 }}>
            left
          </Box>
          <Box intensity={500} style={{ minWidth: 80, flex: 1 }}>
            right
          </Box>
        </SplitLayout>
      </Box>
    );
  },
};
