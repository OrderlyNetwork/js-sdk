import { CSSProperties, useContext, useEffect, useMemo, useRef } from "react";
import { Column } from "./col";
import { TableContext } from "./tableContext";

export const ColGroupItem = (props: { col: Column; index: number }) => {
  const { col: item } = props;

  const ref = useRef<HTMLTableColElement>(null);

  const styles = useMemo<CSSProperties>(() => {
    const styles: CSSProperties = {};

    if (item.width) {
      styles["width"] = `${item.width}px`;
    } else {
      styles["width"] = "auto";
    }

    return styles;
  }, [item]);

  return (
    <col
      ref={ref}
      // @ts-ignore
      className={item.className}
      align={item.align}
      style={styles}
    />
  );
};
