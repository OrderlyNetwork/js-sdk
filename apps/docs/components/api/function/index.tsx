import { FC, useMemo } from "react";
import { PageHeader } from "../pageHeader";

interface Props {
  doc: any;
}

export const FunctionPage: FC<Props> = (props) => {
  const { doc } = props;

  const type = useMemo(() => {
    if (doc?.name.startsWith("use")) {
      return "React Hook";
    }
    return "Function";
  }, [doc.name]);

  return (
    <div>
      <PageHeader title={doc.name} type={type} />
      <div>Returns</div>

      {/* params */}
      <div></div>
    </div>
  );
};
