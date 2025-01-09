import { MainNavWidget } from "@orderly.network/ui-scaffold";
import { Box, Flex, Text } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { StoryObj } from "@storybook/react";

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
