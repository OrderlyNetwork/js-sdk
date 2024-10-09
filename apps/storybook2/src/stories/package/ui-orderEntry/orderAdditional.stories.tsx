import type { Meta, StoryObj } from "@storybook/react";
import {
  OrderEntryWidget,
  OrderEntry,
  AdditionalInfoWidget,
} from "@orderly.network/ui-order-entry";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";

const meta = {
  title: "Package/ui-orderEntry/additional",
  component: AdditionalInfoWidget,
  decorators: [
    (Story) => (
      <Box width={"215px"} r={"lg"} intensity={700} p={3}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = {};