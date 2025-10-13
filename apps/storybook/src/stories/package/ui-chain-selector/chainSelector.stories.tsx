import { Box, Button, Flex, modal } from "@kodiak-finance/orderly-ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
  ChainSelectorWidget,
} from "@kodiak-finance/orderly-ui-chain-selector";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ChainSelectorWidget> = {
  title: "Package/ui-chain-selector/ChainSelector",
  component: ChainSelectorWidget,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Flex r="lg" p={4} gapX={5}>
      <Box width={456} intensity={800} r="xl" p={4}>
        <ChainSelectorWidget variant="wide" />
      </Box>
      <Box width={375} intensity={800} r="xl" p={4}>
        <ChainSelectorWidget variant="compact" />
      </Box>
    </Flex>
  ),
};

// export const OnlyMainnet: Story = {
//   render: () => (
//     <Box width={456} intensity={800} r="xl" p={4}>
//       <ChainSelectorWidget networkId="mainnet" />
//     </Box>
//   ),
// };

export const CommandStyle: Story = {
  render: () => (
    <Flex gapX={5}>
      <Button
        onClick={() => {
          modal
            .show(ChainSelectorDialogId)
            .then((result) => {
              console.log("result", result);
            })
            .catch((error) => {
              console.log("error", error);
            });
        }}
      >
        Switch chain (Dialog)
      </Button>

      <Button
        onClick={() => {
          modal
            .show(ChainSelectorSheetId)
            .then((result) => {
              console.log("result", result);
            })
            .catch((error) => {
              console.log("error", error);
            });
        }}
      >
        Switch chain (Sheet)
      </Button>
    </Flex>
  ),
};

// export const CommandStyleMainnet: Story = {
//   render: () => (
//     <Button
//       onClick={() => {
//         modal
//           .show(ChainSelectorDialogId, {
//             networkId: "mainnet",
//           })
//           .then((result) => {
//             console.log("result", result);
//           })
//           .catch((error) => {
//             console.log("error", error);
//           });
//       }}
//     >
//       Switch chain
//     </Button>
//   ),
// };
