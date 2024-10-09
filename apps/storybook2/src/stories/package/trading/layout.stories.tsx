import type { Meta, StoryObj } from "@storybook/react";
import { TradingPageV2, SplitLayout } from "@orderly.network/trading";
import { Box, cn } from "@orderly.network/ui";
    

const meta = {
  title: "Package/Trading/SplitLayout",
  component: TradingPageV2,
  decorators: [],
} satisfies Meta<typeof TradingPageV2>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Split: Story = {
  render: (args) => {
    return (
      <Box>     
        <SplitLayout style={{
          height: 100,
        }}
        lineBar
        >
          <Box intensity={500} style={{ minWidth: 360 }}>left</Box>
          <Box intensity={500}  style={{ minWidth: 80, flex: 1 }}>right</Box>
        </SplitLayout>
      </Box>
    )
  },
};