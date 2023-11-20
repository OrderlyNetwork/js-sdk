import { FC } from "react";
import { PageHeader } from "../pageHeader";
import { Type } from "@/components/api/Type";
import { Declarations } from "@/components/api/typeAlias/declarations";
import { pathOr } from "ramda";

interface Props {
  doc: any;
}

export const TypeAliasPage: FC<Props> = (props) => {
  const { doc } = props;

  return (
    <div className="space-y-5">
      <PageHeader title={doc.name} type="Type alias" />

      <div className={"p-5 rounded-xl bg-primary-light"}>
        <span className={"text-rose-500"}>{doc.name}</span>
        <span className={"mr-2"}>:</span>
        <Type type={doc.type} />
      </div>

      <Declarations declarations={pathOr([], ["type", "properties"])(doc)} />
    </div>
  );
};
