import { FC } from "react";
import { PageHeader } from "../pageHeader";
import { propOr } from "ramda";
import { Methods } from "../class/methods";
import { Type } from "../Type";

interface Props {
  doc: any;
}

export const VariablePage: FC<Props> = (props) => {
  const { doc } = props;

  return (
    <div>
      <PageHeader title={doc.name} type="Variable" />
      <div className="space-x-1 border-t border-b border-gray-300 py-4">
        <span>
          <span className="text-blue-500">{doc.name}</span>
          <span>:</span>
        </span>
        <span className="text-gray-500">
          <Type type={doc.type} />
        </span>
        <span>=</span>
        <span>{doc.value}</span>
      </div>
    </div>
  );
};
