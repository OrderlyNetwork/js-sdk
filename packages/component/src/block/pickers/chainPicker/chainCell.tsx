import { NetworkImage } from "@/icon";
import { Tag } from "@/tag";
import { FC } from "react";

export interface ChainCellProps {
  name: string;
  id: number;
  bridgeless?: boolean;
  selected?: boolean;
  onClick?: (chain: any) => void;
}

export const ChainCell: FC<ChainCellProps> = (props) => {
  const { id, bridgeless, onClick, name } = props;
  return (
    <div
      className="flex items-center gap-2 p-4 hover:bg-base-contrast/5 cursor-pointer rounded"
      onClick={() => {
        onClick?.({
          id,
          name,
        });
      }}
    >
      <NetworkImage type="chain" id={id} rounded />
      <span>{name}</span>
      {bridgeless && <Tag color="primary">Bridgeless</Tag>}
    </div>
  );
};
