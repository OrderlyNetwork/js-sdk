import { FC, PropsWithChildren } from "react";
import { cva, VariantProps } from "class-variance-authority";

const gridViewVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
  },
});

interface GridViewProps {}

export const GridView: FC<PropsWithChildren<GridViewProps>> = (props) => {
  return <div>gridView</div>;
};
