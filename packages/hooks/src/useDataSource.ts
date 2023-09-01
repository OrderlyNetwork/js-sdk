import { useContext } from "react";
import { DataSourceContext } from "./provider/dataProvider";

export const useDataSource = () => {
  const { dataSource } = useContext(DataSourceContext);

  return dataSource;
};
