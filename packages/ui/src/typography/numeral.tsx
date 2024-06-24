import React, { FC, useMemo } from "react";
import { Text, TextProps } from "./text";
import { RoundingMode, parseNumber } from "./utils";
import { cnBase } from "tailwind-variants";

export type NumeralRule = "percentages" | "price" | "human";

export const isNumeralRule = (rule: string): rule is NumeralRule => {
  return ["percentages", "price", "human"].includes(rule);
};

export type NumeralProps = TextProps & {
  rule?: NumeralRule;

  /**
   * decimal place, default 2 digits
   * @default 2
   */
  dp?: number;

  /**
   * The number of decimal places to round to.
   * tick is obtained directly from the Orderly API and is used to calculate the number of decimal places for prices.
   * If both dp and tick are passed, dp takes priority.
   * Format: 0.00001
   */
  tick?: number;
  /**
   * Rounding mode
   * The method of rounding the decimal digits after the decimal point, options are ceil, floor, round, aligns with Math.ceil, Math.floor, Math.round.
   * @default floor
   */
  rm?: RoundingMode;
  //   truncate?: "ceil" | "floor" | "round" | "truncate";

  /**
   * The number to be formatted
   */
  children: number | string;

  className?: string;

  unitClassName?: string;

  coloring?: boolean;

  loading?: boolean;

  surfix?: React.ReactNode;
  prefix?: React.ReactNode;

  unit?: string;
  cureency?: string;

  /**
   * Whether to display as *****
   */
  visible?: boolean;
  /**
   * Whether to pad with 0
   * @default true
   */
  padding?: boolean;

  /**
   * Whether to show the + or - sign
   */
  showIdentifier?: boolean;

  /**
   * Custom + or - sign
   */
  identifiers?: {
    loss?: React.ReactNode;
    profit?: React.ReactNode;
  };
};

export const Numeral: FC<NumeralProps> = (props) => {
  const {
    rule = "price",
    coloring,
    dp,
    tick,
    surfix,
    prefix,
    visible,
    unit,
    cureency,
    rm,
    padding = true,
    showIdentifier = false,
    identifiers,
    className,
    unitClassName,
    ...rest
  } = props;
  // TODO: check precision

  const num = Number(props.children);

  const child = useMemo(() => {
    if (isNaN(num)) return "--";

    if (typeof visible !== "undefined" && !visible) return "*****";

    return parseNumber(num, {
      rule,
      dp,
      tick,
      rm,
      padding,
      abs: showIdentifier,
    });
  }, [num, visible]);

  const defaultColor = rest.color || "inherit";

  const colorName = useMemo(() => {
    if (!coloring) return defaultColor;
    if (typeof visible !== "undefined" && !visible) return defaultColor;

    if (Number.isNaN(num)) {
      // console.warn(`if coloring, value is need number: ${props.value}`);
      return defaultColor;
    }

    if (num === 0) return "neutral";
    if (num < 0) return "lose";

    return "profit";
  }, [coloring, num, rest.color, props.visible]);

  const identifier = useMemo(() => {
    if (!showIdentifier || Number.isNaN(num) || num === 0) return null;
    if (typeof visible !== "undefined" && !visible) return null;

    if (num < 0) {
      if (identifiers?.loss) return identifiers!.loss;
      // @ts-ignore
      //   return <Minus size={12} />;
      return <span>-</span>;
    }

    if (identifiers?.profit) return identifiers!.profit;
    // @ts-ignore
    // return <Plus size={12} />;
    return <span>+</span>;
  }, [num, props.visible, showIdentifier]);

  const childWithUnit = useMemo(() => {
    if (
      typeof surfix === "undefined" &&
      typeof prefix === "undefined" &&
      typeof unit === "undefined" &&
      typeof cureency === "undefined" &&
      !showIdentifier
    ) {
      return child;
    }

    const surfixEle = surfix ? (
      typeof surfix === "string" ? (
        <span>{surfix}</span>
      ) : (
        surfix
      )
    ) : undefined;

    const unitEle = unit ? (
      <span className={cnBase("orderly-numeral-unit", unitClassName)}>
        {unit}
      </span>
    ) : undefined;

    const prefixEle = prefix ? (
      prefix
    ) : cureency ? (
      <span>{cureency}</span>
    ) : undefined;

    return (
      <>
        {prefixEle}
        {typeof identifier !== "undefined" ? (
          <span>
            {identifier}
            <span>{child}</span>
          </span>
        ) : (
          <span>{child}</span>
        )}
        {unitEle}
        {surfixEle}
      </>
    );
  }, [child, surfix, unit, prefix, identifier, unitClassName]);

  return (
    <Text
      {...rest}
      color={colorName}
      children={childWithUnit}
      className={cnBase("oui-tabular-nums", "oui-space-x-1", className)}
    />
  );
};
