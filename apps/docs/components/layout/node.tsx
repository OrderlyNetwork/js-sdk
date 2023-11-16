import Link from "next/link";

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
        <Link href={`/apis/modules/${slug}`}>{name}</Link>
      </div>
      <ul className="pl-5 space-y-2">
        {children?.map((item) => {
          return (
            <li key={item.id}>
              <Link
                href={`/apis/modules/${slug}/${item.type}/${item.slug}`}
                className="flex gap-1"
              >
                <span className="text-slate-400">{item.type}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
