import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, modal, useScreen } from "@orderly.network/ui";
import {
  LiquidationWidget,
  MobileLiquidationWidget,
  MobilePositionHistoryWidget,
  MobilePositionsWidget,
  PositionHistoryWidget,
  PositionsWidget,
  FundingFeeHistoryUI,
} from "@orderly.network/ui-positions";

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
  decorators: [
    (Stroy) => (
      <Box height={"360px"} className="oui-bg-base-10">
        {Stroy()}
      </Box>
    ),
  ],
};

export const PositionHistory: Story = {
  decorators: [
    (Stroy) => (
      <Box height={"360px"} className="oui-bg-base-10">
        {Stroy()}
      </Box>
    ),
  ],
  render: (arg) => {
    const { isMobile } = useScreen();
    if (isMobile) {
      return (
        <MobilePositionHistoryWidget
          classNames={{ cell: "oui-p-2 oui-bg-base-9" }}
        />
      );
    }
    return <PositionHistoryWidget />;
  },
};

export const Liquidation: Story = {
  decorators: [
    (Stroy) => (
      <Box height={"360px"} className="oui-bg-base-10">
        {Stroy()}
      </Box>
    ),
  ],
  render: (arg) => {
    const { isMobile } = useScreen();
    if (isMobile) {
      return (
        <MobileLiquidationWidget
          classNames={{ cell: "oui-p-2 oui-bg-base-9" }}
        />
      );
    }
    return <LiquidationWidget />;
  },
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

export const FundingFeeHistory: Story = {
  render: () => {
    return <FundingFeeHistoryUI />;
  },
};
