import { useTabScript } from "./tab.script";
import { Tab } from "./tab.ui";

export const TabWidget = () => {
  const state = useTabScript();
  return <Tab {...state} />;
};
