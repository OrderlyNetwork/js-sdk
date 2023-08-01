import { COLOR_VARS } from "./colors";
import { ColorRow } from "./colorRow";

export const ColorVars = () => {
  return (
    <div>
      {COLOR_VARS.map((group) => {
        return (
          <div className={"flex flex-col"}>
            <div>{group.groupName}</div>
            <ColorRow colors={group.colors} />
          </div>
        );
      })}
    </div>
  );
};
