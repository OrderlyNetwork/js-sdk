import { FC } from "react";
import { PageHeader } from "../pageHeader";

interface Props {
  doc: any;
}

export const FunctionPage: FC<Props> = (props) => {
  const { doc } = props;
  return (
    <div>
      <PageHeader title={doc.name} />
      <div>Returns</div>

      {/* params */}
      <div></div>
    </div>
  );
};
