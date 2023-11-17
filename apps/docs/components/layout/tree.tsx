import { FC, useMemo } from "react";
import { TreeNode } from "./node";
import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";

export const TreeView: FC<{ data: any }> = (props) => {
  const { data } = props;
  //   console.log(data);
  return (
    <div className="space-y-2">
      <Accordion.Root
        type="single"
        // defaultValue="item-1"
        collapsible={false}
      >
        {data.map((item) => {
          return (
            <Accordion.Item key={item.id} value={item.name}>
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
