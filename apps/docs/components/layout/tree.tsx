import { FC } from "react";
import { TreeNode } from "./node";
import * as Accordion from "@radix-ui/react-accordion";
import { useRouter } from "next/router";

export const TreeView: FC<{ data: any }> = (props) => {
  const { data } = props;
  const router = useRouter();
  const { locale, query } = router;

  if (!query.module) {
    return null;
  }

  return (
    <div className="orderly-space-y-2 orderly-py-5">
      <Accordion.Root
        type="single"
        collapsible={true}
        defaultValue={query.module as string}
      >
        {data.map((item) => {
          return (
            <Accordion.Item key={item.id} value={item.slug}>
              <TreeNode
                name={item.name}
                children={item.children}
                slug={item.slug}
              />
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </div>
  );
};
