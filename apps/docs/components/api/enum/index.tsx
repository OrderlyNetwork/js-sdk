import { FC } from "react";
import { PageHeader } from "../pageHeader";
import { EnumItem } from "./enumItem";

interface Props {
  doc: any;
}

export const EnumPage: FC<Props> = (props) => {
  const { doc } = props;

  return (
    <div>
      <PageHeader title={doc.name} type={"Enum"} />
      <div className="space-y-5">
        <div className="text-2xl">Enumeration Members</div>
        <div className="space-y-7">
          {doc.members.map((item, index) => {
            return <EnumItem key={item.id} data={item} />;
          })}
        </div>
      </div>
    </div>
  );
};
