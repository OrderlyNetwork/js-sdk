import { FC } from "react";
import { PageHeader } from "./pageHeader";

interface Props {
  doc: any;
}

export const DetailsPage: FC<Props> = (props) => {
  const { doc } = props;
  console.log(doc);
  return (
    <div className="space-y-7">
      <PageHeader title={doc.name} type="Class" />

      {/* <Constructor data={doc.construct} name={doc.name} />
      <Properties properties={propOr([], "properties")(doc)} />
      <Methods methods={propOr([], "methods")(doc)} /> */}
    </div>
  );
};
