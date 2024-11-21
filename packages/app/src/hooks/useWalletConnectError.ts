import { useEventEmitter } from "@orderly.network/hooks";
import { useEffect } from "react";
import { toast } from "@orderly.network/ui";

export function useWalletConnectError() {
  const ee = useEventEmitter();

  useEffect(() => {
    ee.on('wallet:connect-error', (data) => {
      toast.error(data.message);

    })

  }, [ee])

  return {}
}