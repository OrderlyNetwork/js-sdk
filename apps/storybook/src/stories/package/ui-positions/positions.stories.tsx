import type { Meta, StoryObj } from "@storybook/react";
import { PositionHistoryWidget, PositionsWidget } from "@orderly.network/ui-positions";
import { Box, Button, modal } from "@orderly.network/ui";

const meta: Meta<typeof PositionsWidget> = {
  title: "Package/ui-positions/Positions",
  component: PositionsWidget,
  parameters: {
    layout: "fullscreen",
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  decorators: [(Stroy) => <Box height={"360px"}>{Stroy()}</Box>],
};

export const PositionHistory: Story = {
  render: (arg) => {
    return (
      <PositionHistoryWidget />
    );
  }
};



export const MarketClose: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          modal.show("MarketCloseConfirmID", {
            base: "ETH",
            quantity: 222.22,
            onConfirm: async () => {
              return Promise.resolve(0);
            },
            submitting: false,
          });
        }}
      >
        Show market close
      </Button>
    );
  },
};
