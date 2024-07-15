import { CSSProperties, ComponentType, useContext, useMemo } from "react";
import { TableContext } from "./tableContext";
import { ColProps } from "./col";

export const withFixedStyle = <T extends any>(
  WrappedComponent: ComponentType<ColProps>
) => {
  return (props: ColProps & T) => {
    const { col, index } = props;
    const dataset: Record<string, any> = {};
    const { getLeftFixedColumnsWidth, getRightFixedColumnsWidth } =
      useContext(TableContext);
    const styles = useMemo(() => {
      const styles: CSSProperties = {};

      if (col.fixed) {
        styles["backgroundColor"] = "var(--table-background-color)";
      }

      if (col.fixed && col.fixed === "left") {
        styles["left"] = `${getLeftFixedColumnsWidth(index)}px`;
        dataset["data-fixed"] = "left";
      }

      if (col.fixed && col.fixed === "right") {
        styles["right"] = `${getRightFixedColumnsWidth(index)}px`;
        dataset["data-fixed"] = "right";
      }

      return styles;
    }, [index, col.fixed]);

    return <WrappedComponent {...props} style={styles} {...dataset} />;
  };
};
