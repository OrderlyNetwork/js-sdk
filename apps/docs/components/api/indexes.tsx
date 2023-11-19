import { FC, useMemo } from "react";
import { ModuleSectionItem } from "./module/sections";

interface Props {
  doc: any;
  isTOC?: boolean;
}

export const Indexes: FC<Props> = (props) => {
  const { doc, isTOC } = props;

  return (
    <div className="space-y-3">
      <div className="text-2xl">INDEX</div>
      <ModuleSectionItem
        title="Properties"
        type="property"
        isIndex
        data={doc.properties.filter((item) => !item.external)}
      />

      {/* <ModuleSectionItem
        title="Accessors"
        type="function"
        data={accessors}
        isIndex
      /> */}

      <ModuleSectionItem
        title="Methods"
        type="function"
        data={doc.methods.filter((item) => !item.external)}
        isIndex
      />
    </div>
  );
};
