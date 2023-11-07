import { COLOR_VARS } from "./colors";
import { ColorRow } from "./colorRow";

export const ColorVars = () => {
  return (
    <div>
      {COLOR_VARS.map((group, index) => {
        return (
          <div className={"flex flex-col"} key={index}>
            <div>{group.groupName}</div>
            <ColorRow colors={group.colors} name={""} />
          </div>
        );
      })}
    </div>
  );
};
