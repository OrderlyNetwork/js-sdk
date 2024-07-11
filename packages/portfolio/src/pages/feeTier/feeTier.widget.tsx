import { useFeeTierScript } from "./feeTier.script";
import { FeeTier } from "./feeTier.ui";

export const FeeTierWidget = () => {
  const props = useFeeTierScript();
  return <FeeTier {...props} />;
};
