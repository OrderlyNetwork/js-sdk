import { onStorybookRounteChange } from "../../hooks/useStorybookNav";
import { useNav } from "../../playground/hooks/useNav";

const isStorybook = import.meta.env.STORYBOOK === "true";

export function useRouteChange() {
  const { onRouteChange } = useNav();

  return isStorybook ? onStorybookRounteChange : onRouteChange;
}
