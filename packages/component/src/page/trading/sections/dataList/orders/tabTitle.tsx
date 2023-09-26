import { useMemo } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";

export const OrdersTabTitle = () => {
  const { data: pendings } = usePrivateQuery("/v1/orders?status=NEW");

  // const [] = useOrderStream();

  const pendingCount = useMemo(() => {
    if (!Array.isArray(pendings)) return 0;
    return pendings.length;
  }, [pendings]);

  if (pendingCount === 0) {
    return <>{"Pending"}</>;
  }

  return <>{`Pending(${pendingCount})`}</>;
};
