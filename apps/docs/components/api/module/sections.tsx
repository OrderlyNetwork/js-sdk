import Link from "next/link";
import { FC } from "react";

interface ModuleSectionProps {
  title: string;
  moduleName?: string;
  data?: any[];
  slug?: string;
  type:
    | "class"
    | "function"
    | "interface"
    | "typeAlias"
    | "enum"
    | "variable"
    | "namespace";
}

export const ModuleSectionItem: FC<ModuleSectionProps> = (props) => {
  const { data, type, moduleName, slug } = props;

  return (
    <div>
      <h3 className="text-xl font-semibold">{props.title}</h3>
      <div className="grid grid-cols-4">
        {data?.map((item) => {
          return (
            <div key={item.id}>
              <Link href={`/apis/modules/${slug}/${type}/${item.name}`}>
                {item.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
