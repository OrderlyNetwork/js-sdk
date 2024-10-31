import { useEffect, useState } from "react";
import { TableViewProps } from "../tableView";

export function useInit(
  params: Pick<
    TableViewProps<any>,
    "dataSource" | "loading" | "ignoreLoadingCheck"
  >
) {
  const { dataSource, loading, ignoreLoadingCheck } = params;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    if (ignoreLoadingCheck || loading || Array.isArray(dataSource)) {
      setInitialized(true);
    }
  }, [loading, ignoreLoadingCheck, dataSource, initialized]);

  return initialized;
}
