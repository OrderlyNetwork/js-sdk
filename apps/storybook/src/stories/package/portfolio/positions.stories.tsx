import {
  PortfolioLeftSidebarPath,
  PositionsModule,
} from "@kodiak-finance/orderly-portfolio";
import { useTradingLocalStorage } from "@kodiak-finance/orderly-trading";
import { Box } from "@kodiak-finance/orderly-ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PortfolioLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";

const meta: Meta<typeof PositionsModule.PositionsPage> = {
  title: "Package/portfolio/Positions",
  component: PositionsModule.PositionsPage,
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      p={6}
      pb={0}
      intensity={900}
      r="xl"
      width="100%"
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: "calc(100vh - 48px - 29px - 48px)",
      }}
    >
      {children}
    </Box>
  );
};

export const Page: Story = {
  render: () => {
    const local = useTradingLocalStorage();

    return (
      <Container>
        <PositionsModule.PositionsPage
          sharePnLConfig={tradingPageConfig.sharePnLConfig}
          pnlNotionalDecimalPrecision={local.pnlNotionalDecimalPrecision}
          calcMode={local.unPnlPriceBasis}
          onSymbolChange={(symbol) => {
            console.log("symbol changed", symbol);
          }}
        />
      </Container>
    );
  },
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Positions}>
        <Container>
          <PositionsModule.PositionsPage
            sharePnLConfig={tradingPageConfig.sharePnLConfig}
          />
        </Container>
      </PortfolioLayout>
    );
  },
};
