import { useContext, useMemo } from "react";
import { AsAnAffiliate } from "./asAnAffiliate";
import { AsAnTrader } from "./asAnTrader";
import { ReferralContext } from "../../hooks/referralContext";

export const Card = () => {

  const state = useContext(ReferralContext);
  const children = useMemo(() => {

    if (typeof state.overwrite?.ref?.card === 'function') {
      return (state.overwrite?.ref?.card as Function)(state);
    }

    return (
      <div className="orderly-mt-9 orderly-flex orderly-flex-col sm:orderly-flex sm:orderly-flex-col orderly-gap-6 xl:orderly-flex-row 2xl:orderly-flex-row">
        <AsAnAffiliate />
        <AsAnTrader />
      </div>
    );
  }, [state]);

  return (<>{children}</>)
}