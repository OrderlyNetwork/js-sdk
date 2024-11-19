import type { Meta, StoryObj } from "@storybook/react";
import { FeeTierModule, OrdersModule } from "@orderly.network/portfolio";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof FeeTierModule.FeeTierPage> = {
  title: "Package/Portfolio/Orders",
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
    // p: 5,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
