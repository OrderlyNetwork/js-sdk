import { useEffect } from "react";
import { DataFilterProps } from "./dataFilter";

export const Filter = (props: DataFilterProps) => {
  useEffect(() => {
    console.log("----- data filter ------");
  }, []);

  return null;
};
