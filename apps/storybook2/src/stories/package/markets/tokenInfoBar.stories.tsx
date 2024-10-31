import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  TokenInfoBarWidget,
  TokenInfoBarFullWidget,
  MarketsSheetWidget
} from "@orderly.network/markets";
import { Box, Flex, modal, SimpleSheet, useModal } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { useState } from "react";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/TokenInfoBar",
  component: TokenInfoBarFullWidget,
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
          configStore={configStore}
        >
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof TokenInfoBarFullWidget>;

export default meta;
type Story = StoryObj<typeof meta>;


export const DepositTokenInfoBar: Story = {
  render: (args) => {
    return <Flex direction='column' itemAlign='start' gapY={5}>
      <Box width={600} intensity={900} r="2xl" px={3} height={54}>
        <TokenInfoBarFullWidget          
          symbol="PERP_BTC_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
      <Box width={900} intensity={900} r="2xl" px={3} height={54}>
        <TokenInfoBarFullWidget
          symbol="PERP_ETH_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
      <Box width='100%' intensity={900} r="2xl" px={3} height={54}>
        <TokenInfoBarFullWidget
          symbol="PERP_WOO_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
    </Flex>
  },
};

export const MobileTokenInfoBar: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    const onSymbol = async () => {
      setOpen(true)
      // modal.sheet({
      //   title: null,        
      //   classNames: {
      //     content: "oui-w-[280px] !oui-p-0 oui-rounded-bl-[40px]",
      //   },
      //   content: <MarketsSheetWidget
      //             onSymbolChange={(symbol) => {
      //               console.log('onSymbolChange', symbol);
      //           }}/>,
      //   contentProps: { side: "left", closeable:false },
      // });
    };

    return (
      <Box width={430} intensity={900} px={3} height={54}>
        <TokenInfoBarWidget          
          symbol="PERP_BTC_USDC"
          trailing={<Box pl={3}>Trailing</Box>}    
          onSymbol={onSymbol}
        />
        <SimpleSheet
          open={open}
          onOpenChange={setOpen}
          classNames={{
            content: "oui-w-[280px] !oui-p-0 oui-rounded-bl-[40px]",
          }}
          contentProps={{ side: "left", closeable:false }}
        >
          <MarketsSheetWidget
            onSymbolChange={(symbol) => {
              console.log('onSymbolChange', symbol);
              setOpen(false)
            }}            
          />
        </SimpleSheet>
      </Box>
    )    
  },
};