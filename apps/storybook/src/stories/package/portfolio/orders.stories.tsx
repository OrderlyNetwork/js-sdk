import type { Meta, StoryObj } from "@storybook/react";
import { FeeTierModule, OrdersModule } from "@orderly.network/portfolio";
import { Box } from "@orderly.network/ui";
import config from "../../../config";

const meta: Meta<typeof FeeTierModule.FeeTierPage> = {
  title: "Package/portfolio/Orders",
  component: OrdersModule.OrdersPage,
  subcomponents: {},
  decorators: [
    (Story) => (
      <Box className="oui-h-[calc(100vh)]" p={6}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    // p: {
    //   control: {
    //     type: "number",
    //     min: 0,
    //     max: 10,
    //     step: 1,
    //   },
    // },
  },
  args: {
    sharePnLConfig: {
      ...config.tradingPage.sharePnLConfig,
    },
    // p: 5,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
