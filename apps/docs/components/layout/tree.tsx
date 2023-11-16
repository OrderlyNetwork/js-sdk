import { FC, useMemo } from "react";
import { TreeNode } from "./node";

export const TreeView: FC<{ data: any }> = (props) => {
  const { data } = props;
  //   console.log(data);
  return (
    <div className="space-y-2">
      {data.map((item) => {
        return (
          <TreeNode
            key={item.id}
            name={item.name}
            children={item.children}
            slug={item.slug}
          />
        );
      })}
    </div>
  );
};
