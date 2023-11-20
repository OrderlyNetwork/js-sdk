import { FC } from "react";
import { ModuleSectionItem } from "./sections";
import { PageHeader } from "../pageHeader";

interface ModuleSectionProps {
  module: any;

  paths: string[];
}

export const ModulesSection: FC<ModuleSectionProps> = (props) => {
  const { module, paths } = props;

  return (
    <div className="space-y-5">
      <PageHeader title={module.name} type="" />
      <ModuleSectionItem
        paths={paths}
        title="NameSpaces"
        type="namespace"
        data={module.namespaces}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="Classes"
        type="class"
        data={module.classes.filter((item) => !item.external)}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="Interface"
        type="interface"
        data={module.interfaces.filter((item) => !item.external)}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="TypeAlias"
        type="typeAlias"
        data={module.typeAliases}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="Enum"
        type="enum"
        data={module.enums.filter((item) => !item.external)}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="Variable"
        type="variable"
        data={module.variables}
        moduleName={module.name}
        slug={module.slug}
      />
      <ModuleSectionItem
        paths={paths}
        title="Function"
        type="function"
        data={module.functions.filter((item) => !item.external)}
        moduleName={module.name}
        slug={module.slug}
      />
    </div>
  );
};
