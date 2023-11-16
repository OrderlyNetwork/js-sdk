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
      <div className="text-lg font-bold py-2">
        {optional ? (
          <span className="border border-gray-400 rounded-full font-semibold px-2 mr-2 text-sm">
            Optional
          </span>
        ) : null}
        <span>{name}</span>
      </div>
      <div className="flex space-x-1 bg-primary-light p-3 rounded-lg">
        <span>
          <span className="text-blue-500">{`${name}${
            optional ? "?" : ""
          }`}</span>
          <span>:</span>
        </span>

        <Type type={type} />
      </div>
    </div>
  );
};
