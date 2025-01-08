import { useRestrictedAreasScript } from "./restrictedAreas.script";
import { RestrictedAreas } from "./restrictedAreas.ui";

export const RestrictedAreasWidget = () => {
  const state = useRestrictedAreasScript();
  return <RestrictedAreas {...state} />;
};
