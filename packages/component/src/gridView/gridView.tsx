import { FC, PropsWithChildren } from "react";
import { cva, VariantProps } from "class-variance-authority";

const gridViewVariants = cva("grid", {
  variants: {
    cols: {
      1: "orderly-grid-cols-1",
      2: "orderly-grid-cols-2",
      3: "orderly-grid-cols-3",
      4: "orderly-grid-cols-4",
      5: "orderly-grid-cols-5",
      6: "orderly-grid-cols-6",
    },
  },
});

interface GridViewProps {}

export const GridView: FC<PropsWithChildren<GridViewProps>> = (props) => {
  return <div>gridView</div>;
};
