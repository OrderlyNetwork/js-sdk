import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { Deposit } from '@orderly.network/deposit';
import { Box } from "@orderly.network/ui";

const meta = {
    title: "Package/Deposit",
    component: Deposit,
    subcomponents: {
       
    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"} >
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],   
} satisfies Meta<typeof Deposit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DepositForm: Story = {};


// export const Header: Story = {
//     render: (args) => {
//       return <MarketsHeaderWidget />
//     },
  
//     decorators: [
//       (Story) => (
//         <Box>
//           <Story />
//         </Box>
//       ),
//     ],
// }
