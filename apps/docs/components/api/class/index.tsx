import { FC } from "react";
import { PageHeader } from "../pageHeader";

import { propOr } from "ramda";
import { Properties } from "../interface/properties";
import { Constructor } from "./constructor";
import { Methods } from "./methods";

interface Props {
  doc: any;
}

export const ClassPage: FC<Props> = (props) => {
  const { doc } = props;
  console.log(doc);
  return (
    <div className="space-y-5">
      <PageHeader title={doc.name} />

      <Constructor data={doc.construct} />
      <Properties properties={propOr([], "properties")(doc)} />
      <Methods methods={propOr([], "methods")(doc)} />
    </div>
  );
};
