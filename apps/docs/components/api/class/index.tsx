import { FC } from "react";
import { PageHeader } from "../pageHeader";

import { propOr } from "ramda";
import { Properties } from "../interface/properties";
import { Constructor } from "./constructor";
import { Methods } from "./methods";
import { Indexes } from "../indexes";
import { Comment } from "@/components/api/comment";

interface Props {
  doc: any;
}

export const ClassPage: FC<Props> = (props) => {
  const { doc } = props;

  console.log(doc);

  if (!doc) {
    return <div></div>;
  }

  return (
    <div className="space-y-7">
      <PageHeader title={doc.name} type="Class" />
      <Comment doc={doc} />
      <Indexes doc={doc} />

      <Constructor data={doc.construct} name={doc.name} />
      <Properties properties={propOr([], "properties")(doc)} />
      <Methods methods={propOr([], "methods")(doc)} />
    </div>
  );
};
