import { CSSProperties, ComponentType, useContext, useMemo } from "react";
import { TableContext } from "./tableContext";
import { ColProps } from "./col";

export const withFixedStyle = <T extends any>(
  WrappedComponent: ComponentType<ColProps>
) => {
  return (props: ColProps & T) => {
    const { col, index } = props;
    const { getLeftFixedColumnsWidth, getRightFixedColumnsWidth } =
      useContext(TableContext);
    const styles = useMemo(() => {
      const styles: CSSProperties = {};

      if (col.fixed && col.fixed === "left") {
        styles["left"] = `${getLeftFixedColumnsWidth(index)}px`;
      }

      if (col.fixed && col.fixed === "right") {
        styles["right"] = `${getRightFixedColumnsWidth(index)}px`;
      }

      return styles;
    }, [index, col.fixed]);

    return <WrappedComponent {...props} style={styles} />;
  };
};
