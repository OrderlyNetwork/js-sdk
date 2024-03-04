import { TraderIcon } from "@/icons/trader";
import { Button } from "@orderly.network/react"

export const AsAnTrader = () => {

    return (
        <div className="orderly-rounded-lg orderly-p-6 orderly-bg-primary">
            <div className="orderly-flex">
                <div className="orderly-justify-between">
                <div>As a trader</div>
                <div className="orderly-mt-6">Get fee rebates on every trade</div>
                </div>
                <TraderIcon />
            </div>
            
            <div className="orderly-flex orderly-justify-between orderly-mt-2">
                <Button className="orderly-h-[44px]">
                Enter code
                </Button>

                <div>
                    <div>0%~20%</div>
                    <div>Rebate</div>
                </div>
            </div>
        </div>
    );
}