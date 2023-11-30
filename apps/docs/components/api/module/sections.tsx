import Link from "next/link";
import { FC } from "react";
import { TypeIcon } from "../typeIcon";

interface ModuleSectionProps {
  title: string;
  moduleName?: string;
  data?: any[];
  slug?: string;
  isIndex?: boolean;
  paths: string[];

  type:
    | "class"
    | "function"
    | "interface"
    | "typeAlias"
    | "enum"
    | "property"
    | "accessor"
    | "variable"
    | "namespace";
}

export const ModuleSectionItem: FC<ModuleSectionProps> = (props) => {
  const { data, type, slug, paths, isIndex = false } = props;

  if (!data?.length) return null;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-2">{props.title}</h3>
      <div className="grid grid-cols-4 gap-x-5">
        {data?.map((item) => {
          return (
            <div key={item.id} className="flex items-center gap-1 py-1">
              <TypeIcon type={(type as any).substring(0, 1).toUpperCase()} />
              <Link
                className="hover:underline underline-offset-4 break-all"
                href={
                  isIndex
                    ? `#${item.name}`
                    : `/apis/modules/${paths.join("/")}/${item.name}`
                }
              >
                <span>{item.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
