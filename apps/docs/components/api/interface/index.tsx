import { FC } from "react";
import { PageHeader } from "../pageHeader";
import { Properties } from "./properties";
import { propOr } from "ramda";

interface Props {
  doc: any;
}

export const InterfacePage: FC<Props> = (props) => {
  const { doc } = props;
  console.log(doc);
  return (
    <div>
      <PageHeader title={doc.name} />

      {/* params */}
      <Properties properties={propOr([], "properties")(doc)} />
    </div>
  );
};
