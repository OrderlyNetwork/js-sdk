import Link from "next/link";
import { TypeIcon } from "../api/typeIcon";

export const TreeNode = ({
  name,
  slug,
  children,
}: {
  name: string;
  slug: string;
  children?: any[];
}) => {
  return (
    <div>
      <div>
        <Link href={`/apis/modules/${slug}`} className="font-semibold text-lg">
          {name}
        </Link>
      </div>
      <ul className="pl-5 space-y-2">
        {children?.map((item) => {
          return (
            <li key={item.id}>
              <Link
                href={`/apis/modules/${slug}/${item.name}`}
                className="flex gap-1 items-center"
              >
                <TypeIcon type={item.type.substring(0, 1).toUpperCase()} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
