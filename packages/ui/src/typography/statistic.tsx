import React, { ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const statisticVariants = tv({
  slots: {
    root: "oui-text-base oui-flex",
  },
  variants: {
    align: {
      start: {
        root: "oui-text-left",
      },
      center: {
        root: "oui-text-center",
      },
      end: {
        root: "oui-text-right",
      },
    },
    color: {},
  },
});

type StatisticProps = VariantProps<typeof statisticVariants> & {
  label: string | ReactNode;
  value: string | number | ReactNode;
  coloring?: boolean;
};

const Statistic = React.forwardRef<React.Ref<HTMLDivElement>, StatisticProps>(
  (props, ref) => {
    const {} = props;
    const { root } = statisticVariants({});
    return <div className={root()}></div>;
  }
);

export { Statistic, statisticVariants };
