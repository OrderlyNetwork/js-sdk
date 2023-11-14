import Link from "next/link";
import { FC, useMemo } from "react";
import { Type } from "../Type";

interface Props {
  name: string;
  type: any;
  readonly?: boolean;
  optional?: boolean;
}

export const PropertyItem: FC<Props> = (props) => {
  const { name, type, readonly, optional } = props;

  return (
    <div>
      <div className="text-lg font-bold py-2">{name}</div>
      <div className="flex gap-1">
        <span className="text-blue-500">{`${name}${optional ? "?" : ""}`}</span>
        <span>:</span>
        <Type type={type} />
      </div>
    </div>
  );
};
