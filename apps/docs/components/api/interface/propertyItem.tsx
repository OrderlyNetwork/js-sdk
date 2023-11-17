import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { FC, Fragment, useMemo } from "react";
import { Type } from "../Type";
import { path } from "ramda";

interface Props {
  name: string;
  type: any;
  readonly?: boolean;
  optional?: boolean;
}

export const PropertyItem: FC<Props> = (props) => {
  const { name, type, readonly, optional } = props;

  // console.log("---------PropertyItem------->>>>", props);

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold py-2 flex items-center">
        <a id={`#${name}`}></a>
        {optional ? (
          <span className="border border-gray-400 rounded-full font-semibold px-2 mr-2 text-sm">
            Optional
          </span>
        ) : null}
        <span className="text-xl">{name}</span>
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
      <div className="space-y-4">
        <div>
          <strong>Type declaration</strong>
        </div>

        {Array.isArray(type.signatures) && type.signatures.length > 0 ? (
          <>
            <div>
              <strong>Parameters</strong>
            </div>
            <ul className="list-inside list-disc">
              {type.signatures.map((signature: any) => {
                return signature.parameters.map((param: any, index: number) => {
                  return (
                    <li key={param.id} className="space-x-1">
                      <span className="text-blue-500">{`${param.name}:`}</span>
                      <Type type={param.type} />
                    </li>
                  );
                });
              })}
            </ul>
          </>
        ) : null}
        <div>
          <strong>Returns</strong>
        </div>
      </div>
    </div>
  );
};
