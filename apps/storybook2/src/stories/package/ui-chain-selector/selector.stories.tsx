import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { DepositFormWidget } from '@orderly.network/ui-transfer';
import { Box, Button, Flex, modal } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { ChainSelectorWidget } from '@orderly.network/ui-chain-selector'

const networkId = "mainnet";
const configStore = new CustomConfigStore({ networkId, env: "staging", brokerName: 'Orderly', brokerId: 'orderly' });


const meta = {
  title: "Package/ui-chain-selector/ChainSelector",
  component: ChainSelectorWidget,
  // subcomponents: {

  // },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId="testnet" >
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof ChainSelectorWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Box width="380px" intensity={800} r='lg' p={4}>
      <ChainSelectorWidget />
    </Box>
  ),
};


export const CommandStyle: Story = {
  render: () => (
    <Button onClick={() => {
      modal.show('ChainSelector').then((result) => {
        console.log('result', result);
      }).catch((error) => {
        console.log('error', error);
      });
    }}>Switch chain</Button>
  ),
};
