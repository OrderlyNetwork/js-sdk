import { useHowItWorksScript } from "./howItWorks.script";
import { HowItWorks } from "./howItWorks.ui";

export type HowItWorksWidgetProps = {};

export const HowItWorksWidget: React.FC<HowItWorksWidgetProps> = () => {
  const state = useHowItWorksScript();
  return <HowItWorks {...state} />;
};
