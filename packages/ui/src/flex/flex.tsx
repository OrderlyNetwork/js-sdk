import { ElementRef, forwardRef } from "react";
import { layoutVariants } from "../layout/layout";
import { gapVariants } from "../layout/gap";
import { parseSizeProps } from "../helpers/parse-props";
import { Slot } from "@radix-ui/react-slot";
import { tv, VariantProps } from "tailwind-variants";
import { positionVariants } from "../layout/position";

type FlexElement = ElementRef<"div">;

// interface CommonFlexProps extends MarginProps, LayoutProps, FlexOwnProps {}
// type FlexDivProps = { as?: 'div' } & ComponentPropsWithout<'div', RemovedProps>;
// type FlexSpanProps = { as: 'span' } & ComponentPropsWithout<'span', RemovedProps>;
// type FlexProps = CommonFlexProps & (FlexSpanProps | FlexDivProps);

const flexBaseVariant = tv({
  variants: {
    ...gapVariants.variants,
    ...layoutVariants.variants,
    ...positionVariants.variants,
  },
});

const flexVariant = tv(
  {
    extend: flexBaseVariant,
    base: ["oui-flex"],
    variants: {
      display: {
        flex: "oui-flex",
        inlineFlex: "oui-inline-flex",
      },
      direction: {
        row: "oui-flex-row",
        rowReverse: "oui-flex-row-reverse",
        column: "oui-flex-col",
        columnReverse: "oui-flex-col-reverse",
      },
      itemAlign: {
        start: "oui-items-start",
        end: "oui-items-end",
        center: "oui-items-center",
        baseline: "oui-items-baseline",
        stretch: "oui-items-stretch",
      },
      justify: {
        start: "oui-justify-start",
        end: "oui-justify-end",
        center: "oui-justify-center",
        between: "oui-justify-between",
        around: "oui-justify-around",
        evenly: "oui-justify-evenly",
        stretch: "oui-justify-stretch",
      },
      wrap: {
        noWrap: "oui-flex-nowrap",
        wrap: "oui-flex-wrap",
        wrapReverse: "oui-flex-wrap-reverse",
      },
    },
    defaultVariants: {
      display: "flex",
      direction: "row",
      itemAlign: "start",
      justify: "start",
      wrap: "noWrap",
      // gap: 0,
      // gapX: 0,
      // gapY: 0,
    },
  },
  {
    responsiveVariants: true,
    // twMerge: true,
    // twMergeConfig: {
    //   prefix: "oui-",
    // },
  }
);

// const flexVariant = compose(layoutVariants, gapVariants, flexBaseVariant);
interface FlexProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariant> {
  asChild?: boolean;
  as?: "div" | "span";
  width?: string | number;
  height?: string | number;
}

const Flex = forwardRef<FlexElement, FlexProps>((props, forwardedRef) => {
  const {
    asChild = false,
    as: TAG = "div",
    className,
    p,
    px,
    py,
    direction,
    itemAlign,
    justify,
    gap,
    gapX,
    gapY,
    style,
    wrap,
    position,
    ...rest
  } = parseSizeProps(props);

  const Comp = asChild ? Slot : TAG;

  return (
    <Comp
      style={style}
      className={flexVariant({
        className,
        p,
        px,
        py,
        gap,
        gapX,
        gapY,
        direction,
        justify,
        itemAlign,
        wrap,
        position,
      })}
      {...rest}
      ref={forwardedRef}
    />
  );
});

Flex.displayName = "Flex";

export { Flex, flexVariant };

export type { FlexProps };
