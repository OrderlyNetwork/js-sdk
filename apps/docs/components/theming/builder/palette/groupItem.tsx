import { FC } from "react";
import { PaletteItem } from "./paletteItem";
import { NamedColor, NamedColorGroup } from "@/types/theme";
import { ActiveColor } from "@/components/theming/builder/palette/paletteContext";
import { Collapse } from "@douyinfe/semi-ui";

interface Props {
  groupName: string;
  items: NamedColor[];
  onClick?: (color: ActiveColor) => void;
  selectColor: ActiveColor | null;
}

export const GroupItem: FC<Props> = (props) => {
  return (
    <Collapse.Panel header={props.groupName} itemKey={props.groupName}>
      <div className={"flex flex-col gap-2"}>
        {props.items.map((item, index) => {
          return (
            <PaletteItem
              key={index}
              name={item.name}
              reference={item.reference}
              groupName={props.groupName}
              onClick={props.onClick}
              color={item.color}
              active={
                props.selectColor?.color.name === item.name &&
                props.selectColor?.groupName === props.groupName
              }
            />
          );
        })}
      </div>
    </Collapse.Panel>
  );
};
