import { FC } from "react";
import { ModuleSectionItem } from "./sections";
import { PageHeader } from "../pageHeader";

interface ModuleSectionProps {
  module: any;
}

export const ModulesSection: FC<ModuleSectionProps> = (props) => {
  const { module } = props;
  return (
    <div className="space-y-5">
      <PageHeader title={module.name} type="" />
      <ModuleSectionItem
        title="NameSpaces"
        type="namespace"
        data={module.namespaces}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="Classes"
        type="class"
        data={module.classes}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="Interface"
        type="interface"
        data={module.interfaces}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="TypeAlias"
        type="typeAlias"
        data={module.typeAliases}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="Enum"
        type="enum"
        data={module.enums}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="Variable"
        type="variable"
        data={module.variables}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        title="Function"
        type="function"
        data={module.functions}
        moduleName={module.name}
        slug={module.slug}
      />
    </div>
  );
};
