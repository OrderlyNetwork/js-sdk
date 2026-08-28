import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import { PredictionPortfolioModule } from "@orderly.network/prediction";
import { PortfolioLayout } from "../../../components/layout";

export default {
  title: "Package/portfolio/Predictions",
};

export const Default = () => (
  <PortfolioLayout currentPath={PortfolioLeftSidebarPath.Predictions}>
    <PredictionPortfolioModule.PredictionPortfolioWidget />
  </PortfolioLayout>
);
