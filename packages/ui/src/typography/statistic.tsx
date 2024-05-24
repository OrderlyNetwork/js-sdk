import React, {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from "react";
import { type VariantProps, cnBase } from "tailwind-variants";
import { tv } from "../utils/tv";
import { Numeral, NumeralProps } from "./numeral";

const statisticVariants = tv({
  slots: {
    root: "oui-text-base oui-flex oui-flex-col",
    label: "oui-text-xs oui-text-base-contrast-36",
    value: "",
  },
  variants: {
    align: {
      left: {
        root: "oui-items-start",
      },

      right: {
        root: "oui-items-end",
      },
    },
    // color: {},
  },
  defaultVariants: {
    align: "left",
    // color: "default",
  },
});

type StatisticLabelProps = VariantProps<typeof statisticVariants> &
  HTMLAttributes<HTMLDivElement> & {
    // label: string | ReactNode;
  };

const StatisticLabel = React.forwardRef<HTMLDivElement, StatisticLabelProps>(
  (props, ref) => {
    // const { label } = props;
    const { label: labelClassName } = statisticVariants({});
    return (
      <div ref={ref} className={labelClassName()}>
        {props.children}
      </div>
    );
  }
);

StatisticLabel.displayName = "StatisticLabel";

type DivElement = React.ElementRef<"div">;

type StatisticProps = VariantProps<typeof statisticVariants> &
  HTMLAttributes<HTMLDivElement> & {
    label: string | ReactNode;
    valueProps?: NumeralProps;
  };

const Statistic = React.forwardRef<
  DivElement,
  PropsWithChildren<StatisticProps>
>((props, ref) => {
  const { label, valueProps, align, className, children, ...rest } = props;
  const { root, value: valueClassName } = statisticVariants({ align });

  const value = useMemo(() => {
    if (typeof children === "string") {
      const { className: valueClass, ...restValueProps } = valueProps ?? {};
      return (
        <Numeral
          children={children}
          {...restValueProps}
          className={cnBase(
            valueClassName({
              className: valueClass,
            }),
            "oui-font-semibold",
            !valueProps?.coloring && "oui-text-base-contrast-80"
          )}
        />
      );
    }
    return children;
  }, [children, valueProps]);

  return (
    <div {...rest} className={root({ className })} ref={ref}>
      <StatisticLabel>{label}</StatisticLabel>
      {value}
    </div>
  );
});

Statistic.displayName = "Statistic";

export { Statistic, StatisticLabel, statisticVariants };
