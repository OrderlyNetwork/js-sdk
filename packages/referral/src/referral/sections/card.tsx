import { AsAnAffiliate } from "./asAnAffiliate";
import { AsAnTrader } from "./asAnTrader";

export const Card = () => {

    return (
        <div className="orderly-mt-9 orderly-flex orderly-flex-col sm:orderly-flex sm:orderly-flex-col orderly-gap-6 xl:orderly-flex-row 2xl:orderly-flex-row">
        <AsAnAffiliate />
        <AsAnTrader />
      </div>
    );
}