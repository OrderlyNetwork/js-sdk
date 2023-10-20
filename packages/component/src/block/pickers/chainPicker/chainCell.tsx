import { NetworkImage } from "@/icon";
import { Tag } from "@/tag";
import { Circle } from "lucide-react";
import { FC } from "react";

export interface ChainCellProps {
  name: string;
  id: number;
  bridgeless?: boolean;
  selected?: boolean;
  onClick?: (chain: any) => void;
}

export const ChainCell: FC<ChainCellProps> = (props) => {
  const { id, bridgeless, onClick, name, selected } = props;
  return (
    <div
      className="flex items-center p-4 hover:bg-base-contrast/5 cursor-pointer rounded"
      onClick={() => {
        onClick?.({
          id,
          name,
        });
      }}
    >
      <div className="flex-1 flex items-center space-x-3">
        <NetworkImage type="chain" id={id} rounded />
        <span>{name}</span>
        {bridgeless && <Tag color="primary">Bridgeless</Tag>}
      </div>
      {selected && (
        <Circle className="fill-primary-light stroke-none w-[8px] h-[8px]" />
      )}
    </div>
  );
};
