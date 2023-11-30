import { FC } from "react";
import { Type } from "../Type";

interface Props {
  data: any;
  name: string;
}

export const Constructor: FC<Props> = ({ data, name }) => {
  return (
    <div className="space-y-4">
      <div className="text-2xl">Constructors</div>

      <div className="space-x-1 border-t border-b border-gray-300 py-4 text-xl">
        <span className="text-sky-600">new</span>
        <span>
          <span className="text-sky-600">{name}</span>
          <span className="text-gray-500">(</span>
          <span className="text-blue-500">
            {data?.parameters?.map((item, index) => {
              if (index + 1 === data.parameters.length) {
                return <span key={item.id}>{item.name}</span>;
              }
              return (
                <>
                  <span key={item.id}>{item.name}</span>
                  <span className="mx-1">,</span>
                </>
              );
            })}
          </span>

          <span className="text-gray-500">)</span>
        </span>

        <span>:</span>
        <span className="text-sky-600 italic mx-2">{name}</span>
      </div>

      <div className="text-xl">Parameters</div>

      <ul className="list-disc list-inside space-y-2">
        {data?.parameters?.map((item) => {
          return (
            <li key={item.id}>
              <span className="text-blue-500">{item.name}</span>
              <span className="mx-1">:</span>
              <Type type={item.type} />
            </li>
          );
        })}
      </ul>
      <div className="text-xl space-x-1">
        <span>Returns:</span>
        <span className="italic">{name}</span>
      </div>
    </div>
  );
};
