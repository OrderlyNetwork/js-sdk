import Link from "next/link";
import { FC } from "react";
import { TypeIcon } from "../typeIcon";

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

  if (!data?.length) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold my-1">{props.title}</h3>
      <div className="grid grid-cols-4">
        {data?.map((item) => {
          return (
            <div key={item.id}>
              <Link
                href={`/apis/modules/${slug}/${item.name}`}
                className="flex items-center gap-1 py-1"
              >
                <TypeIcon type={(type as any).substring(0, 1).toUpperCase()} />
                <span>{item.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
