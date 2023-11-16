import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
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

  console.log("---------PropertyItem------->>>>", props);

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold py-2 flex items-center">
        <a id={`#${name}`}></a>
        {optional ? (
          <span className="border border-gray-400 rounded-full font-semibold px-2 mr-2 text-sm">
            Optional
          </span>
        ) : null}
        <span>{name}</span>
        <a href={`#${name}`}>
          <LinkIcon size={14} className="stroke-gray-400 ml-2" />
        </a>
      </div>
      <div className="flex space-x-1 bg-primary-light p-3 rounded-lg">
        <span>
          <span className="text-blue-500">{`${name}${
            optional ? "?" : ""
          }`}</span>
          <span className="mr-1">:</span>
          <Type type={type} />
        </span>
      </div>
      <div>
        <div>
          <strong>Type declaration</strong>
        </div>
      </div>
    </div>
  );
};
