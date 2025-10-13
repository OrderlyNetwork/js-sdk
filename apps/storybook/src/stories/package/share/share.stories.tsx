import { Button, Flex, modal } from "@kodiak-finance/orderly-ui";
import {
  SharePnLBottomSheetId,
  SharePnLBottomSheetWidget,
  SharePnLDialogId,
  SharePnLDialogWidget,
} from "@kodiak-finance/orderly-ui-share";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof SharePnLDialogWidget> = {
  title: "Package/ui-share/SharePnL",
  component: SharePnLDialogWidget,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {
    pnl: {
      entity: {
        symbol: "PERP_ETH_USDC",
        //pnl: 20,
        roi: 1.22 * 100,
        side: "LONG",
        openPrice: 2518.74,
        openTime: 1725345164501,
        markPrice: 2518.81,
        quantity: 0.0794,
      },
      leverage: 10,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  decorators: [
    (Story) => (
      <Flex style={{ width: "624px" }} direction={"column"}>
        <Story />
      </Flex>
    ),
  ],
};

export const Mobile: Story = {
  render: (arg) => {
    return (
      <Flex style={{ width: "375px" }} direction={"column"}>
        <SharePnLBottomSheetWidget pnl={arg.pnl} />
      </Flex>
    );
  },
};

export const CommandStyle: Story = {
  render: (arg) => {
    const { pnl } = arg;
    console.log("xxxx pnl config", arg);

    return (
      <Flex direction={"column"} gap={2}>
        <Button
          onClick={() => {
            modal.show(SharePnLDialogId, { pnl });
          }}
        >
          Share PnL (Desktop)
        </Button>
        <Button
          onClick={() => {
            modal.show(SharePnLBottomSheetId, { pnl });
          }}
        >
          Share PnL (mWeb)
        </Button>
      </Flex>
    );
  },
};
