import { useTitleScript } from "./title.script";
import { Title } from "./title.ui";

export const TitleWidget = () => {
  const state = useTitleScript();
  return <Title {...state} />;
};
