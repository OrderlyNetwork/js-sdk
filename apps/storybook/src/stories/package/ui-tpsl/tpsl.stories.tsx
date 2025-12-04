import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Box } from "@veltodefi/ui";
import { TPSLWidget, PositionTPSLConfirm } from "@veltodefi/ui-tpsl";

const meta: Meta<typeof TPSLWidget> = {
  title: "Package/ui-tpsl/TPSL",
  component: TPSLWidget,
  parameters: {
    layout: "centered",
  },
  args: {
    symbol: "PERP_BTC_USDC",
    position: {
      symbol: "PERP_BTC_USDC",
      position_qty: 0.01129,
      cost_position: 786.620603,
      last_sum_unitary_funding: 14680.7,
      pending_long_qty: 0,
      pending_short_qty: 0,
      settle_price: 69674.10124004,
      average_open_price: 68400.7,
      unsettled_pnl: -247.497136,
      mark_price: 64064.8,
      est_liq_price: 0,
      timestamp: 1717147723392,
      mmr: 0.012,
      imr: 0.1,
      IMR_withdraw_orders: 0.1,
      MMR_with_orders: 0.012,
      pnl_24_h: 0,
      fee_24_h: 0,
    },
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Stroy) => (
      <Box width={"360px"} p={5} intensity={800} r={"lg"}>
        {Stroy()}
      </Box>
    ),
  ],
};

export const PositionConfirm: Story = {
  render: (args) => <PositionTPSLConfirm {...args} />,
  decorators: [
    (Stroy) => (
      <Box width={"320px"} px={5} intensity={800} r={"lg"}>
        {Stroy()}
      </Box>
    ),
  ],
  args: {
    symbol: "PERP_BTC_USDC",
  },
};

// export const Dialog: Story = {
//   render: (args) => {
//     return <TPSLEditorWidget {...args} />;
//   },
//   args: {
//     symbol: "PERP_BTC_USDC",
//     position: {
//       symbol: "PERP_BTC_USDC",
//       position_qty: 0.01129,
//       cost_position: 786.620603,
//       last_sum_unitary_funding: 14680.7,
//       pending_long_qty: 0,
//       pending_short_qty: 0,
//       settle_price: 69674.10124004,
//       average_open_price: 68400.7,
//       unsettled_pnl: -247.497136,
//       mark_price: 64064.8,
//       est_liq_price: 0,
//       timestamp: 1717147723392,
//       mmr: 0.012,
//       imr: 0.1,
//       IMR_withdraw_orders: 0.1,
//       MMR_with_orders: 0.012,
//       pnl_24_h: 0,
//       fee_24_h: 0,
//     },
//     onCancel: fn(),
//   },
// };
