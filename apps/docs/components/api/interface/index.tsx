import { FC } from "react";
import { PageHeader } from "../pageHeader";
import { Properties } from "./properties";
import { propOr } from "ramda";
import { Methods } from "../class/methods";

interface Props {
  doc: any;
}

export const InterfacePage: FC<Props> = (props) => {
  const { doc } = props;
  console.log(doc);
  return (
    <div>
      <PageHeader title={doc.name} type="Interface" />

      {/* params */}
      <Properties properties={propOr([], "properties")(doc)} />

      <Methods methods={propOr([], "methods")(doc)} />
    </div>
  );
};
