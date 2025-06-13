import { useMarketsHeaderScript } from "./header.script";
import { MarketsHeader } from "./header.ui";

export const MarketsHeaderWidget = () => {
  const state = useMarketsHeaderScript();
  return <MarketsHeader {...state} />;
};
