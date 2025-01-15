import { MainNavWidget } from "@orderly.network/ui-scaffold";
import { Box, ExtensionPositionEnum, Flex, installExtension, Text } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { StoryObj } from "@storybook/react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

const meta = {
    title: "Package/wallet-connector-privy",
    component: MainNavWidget, 
    decorators: [
        (Story: any) => (
                <Box height={600}>
                    <Story />
                </Box>
        )
    ],
    parameters: {
        walletConnectorType: "privy"
    }
}

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {}



//
// const useAccountMenu = () => {
//
//     const { account, state } = useAccount();
//     // const connect = async () => {
//     //     const res = await connectWallet();
//     //     //
//     //     // if (!res) return;
//     //     //
//     //     // if (res.wrongNetwork) {
//     //     //     switchChain();
//     //     // } else {
//     //     //     statusChangeHandler(res);
//     //     // }
//     // };
//     console.log('-- xxxx useaccountmenu',account, state);
//     return {
//         currentWallet: "0x1234567890",
//     };
// };
// installExtension({
//     name: "account-menu",
//     scope: ["*"],
//     positions: [ExtensionPositionEnum.AccountMenu],
//     __isInternal: true,
// })((props) => {
//     console.log('account-menu', props);
//     return <div onClick={props.connect}>{props.currentWallet}</diva>;
// });
//

