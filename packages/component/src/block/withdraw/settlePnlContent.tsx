import { FC } from "react"

export const SettlePnlContent: FC = () => {
    return (
        <span className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
            Are you sure you want to settle your PnL? It may take one minute
            before you can withdraw it.
        </span>
    );
}