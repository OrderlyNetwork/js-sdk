import type { Meta, StoryObj } from "@storybook/react";
import { PositionsModule } from "@orderly.network/portfolio";
import { sharePnLConfig } from "../trading/config";
import { useTradingLocalStorage } from "@orderly.network/trading";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof PositionsModule.PositionsPage> = {
  title: "Package/Portfolio/Positions",
  component: PositionsModule.PositionsPage,
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
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: () => {
    const local = useTradingLocalStorage();

    return (
      <PositionsModule.PositionsPage
        sharePnLConfig={sharePnLConfig}
        pnlNotionalDecimalPrecision={local.pnlNotionalDecimalPrecision}
        calcMode={local.unPnlPriceBasis}
        onSymbolChange={(symbol) => {
          console.log("symbol changed", symbol);
        }}
      />
    );
  },
};
