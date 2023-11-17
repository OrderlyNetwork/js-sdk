import Link from "next/link";
import { TypeIcon } from "../api/typeIcon";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

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
      <Accordion.Header>
        <Accordion.Trigger asChild>
          <Link
            href={`/apis/modules/${slug}`}
            className="font-semibold text-lg py-3 hover:text-gray-700 flex items-center justify-between"
          >
            <span>{name}</span>
            <ChevronDown
              size={16}
              className="text-violet10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Link>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="text-mauve11 bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[15px]">
        <ul className="pl-5 space-y-2">
          {children?.map((item) => {
            // console.log(item);
            const link = `/apis/modules/${slug}/${item.name}`;
            return (
              <li key={item.id}>
                <Link href={link} className="flex gap-1 items-center">
                  <TypeIcon type={item.type.substring(0, 1).toUpperCase()} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Accordion.Content>
    </div>
  );
};
