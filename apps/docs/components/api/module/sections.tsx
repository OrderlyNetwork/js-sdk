import Link from "next/link";
import { FC } from "react";
import { TypeIcon } from "../typeIcon";

interface ModuleSectionProps {
  title: string;
  moduleName?: string;
  data?: any[];
  slug?: string;
  isIndex?: boolean;

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
  const { data, type, slug, isIndex = false } = props;

  if (!data?.length) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold my-1">{props.title}</h3>
      <div className="grid grid-cols-4">
        {data?.map((item) => {
          return (
            <div key={item.id} className="flex items-center gap-1 py-1">
              <TypeIcon type={(type as any).substring(0, 1).toUpperCase()} />
              <Link
                onClick={() => {
                  // console.log(item)
                  // window.scrollTo({
                  //   top: 500,
                  //   behavior: "smooth",
                  // });
                }}
                className="hover:underline underline-offset-4"
                href={
                  isIndex
                    ? `#${item.name}`
                    : `/apis/modules/${slug}/${item.name}`
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
