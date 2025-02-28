import { FC } from "react";
import { useRestrictedAreasScript } from "./restrictedAreas.script";
import { RestrictedAreas, RestrictedAreasProps } from "./restrictedAreas.ui";

export type RestrictedAreasWidgetProps = Pick<
  RestrictedAreasProps,
  "className"
>;

export const RestrictedAreasWidget: FC<RestrictedAreasWidgetProps> = (
  props
) => {
  const state = useRestrictedAreasScript();
  return <RestrictedAreas {...props} {...state} />;
};
