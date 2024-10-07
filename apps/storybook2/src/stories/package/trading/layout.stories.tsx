import type { Meta, StoryObj } from "@storybook/react";
import { TradingPageV2 } from "@orderly.network/trading";
import Split from '@uiw/react-split';
import { Box, cn } from "@orderly.network/ui";
    

const meta = {
  title: "Package/Trading/SplitLayout",
  component: TradingPageV2,
  decorators: [],
} satisfies Meta<typeof TradingPageV2>;

export default meta;
type Story = StoryObj<typeof meta>;


export const SplitLayout: Story = {
  render: (args) => {
    return (
      <Box>     
        <Split style={{
          height: 100,
        }}
        lineBar
        renderBar={({ onMouseDown, ...props }) => {
          return (
            <div
              {...props}
              className={cn(
                props.className,
                "oui-mx-1 hover:!oui-bg-primary-light !oui-w-[2px]",
                'hover:!oui-shadow-[0px_0px_4px_0px] hvoer:!oui-shadow-primary-light/80'
              )}
            >
              <div
                onMouseDown={onMouseDown}
                className={cn(
                  "after:!oui-w-[2px] after:!oui-bg-transparent after:!oui-shadow-none",
                )}
              />
            </div>
          );
          }}>
          <Box intensity={500} style={{ minWidth: 360 }}>test</Box>
          <Box intensity={500}  style={{ minWidth: 80, flex: 1 }}>Right Pane</Box>
        </Split>
      </Box>
    )
  },
};