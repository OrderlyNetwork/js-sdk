import { MainNavWidget } from "@orderly.network/ui-scaffold";
import { Box, ExtensionPositionEnum, Flex, installExtension, Text } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { StoryObj } from "@storybook/react";
import { TradingPage } from "@orderly.network/trading";
import config from "../../../config.tsx";
import { OrderlyIcon } from "../trading/icons.tsx";
import { useState } from "react";

const meta = {
    title: "Package/wallet-connector-privy",
    component: TradingPage,
    decorators: [
        (Story) => {
            return (
              <Scaffold mainNavProps={config.scaffold.mainNavProps}>
                  <Story />
              </Scaffold>
            );
        },
    ],
    parameters: {
        layout: "fullscreen",
        walletConnectorType: "privy"

    },
    tags: ["autodocs"],
    argTypes: {},
    args: {
        symbol: "PERP_BTC_USDC",
        referral: {
            onClickReferral: () => {
                console.log("click referral");
            },
        },
        tradingRewards: {
            onClickTradingRewards: () => {
                console.log("click trading rewards");
            },
        },
        bottomSheetLeading: <OrderlyIcon size={18} />,
        // bottomSheetLeading: "Orderly"
    },
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (arg) => {
        const [symbol, setSymbol] = useState("PERP_BTC_USDC");

        return (
          <TradingPage
            {...arg}
            tradingViewConfig={config.tradingPage.tradingViewConfig}
            sharePnLConfig={config.tradingPage.sharePnLConfig}
            symbol={symbol}
            onSymbolChange={(symbol) => {
                setSymbol(symbol.symbol);
            }}
          />
        );
    },
};
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

