import { FC } from "react";
import { Box } from "@orderly.network/ui";
import { CopyAddress } from "./CopyAddress";
import { DepositLimits } from "./DepositLimits";
import { DepositStatusBlock } from "./DepositStatus";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { WarningBanner } from "./WarningBanner";
import { useExclusiveDeposit } from "./useExclusiveDeposit";

type ExclusiveDepositProps = {
  active?: boolean;
};

export const ExclusiveDeposit: FC<ExclusiveDepositProps> = ({ active }) => {
  const {
    address,
    qrUri,
    minimumDeposit,
    estimatedArrivalText,
    latestEvent,
    pendingCount,
    explorerUrl,
  } = useExclusiveDeposit({ active });

  return (
    <Box className="oui-flex oui-flex-col oui-items-center oui-rounded-xl oui-bg-base-8 oui-tracking-[0.03em]">
      <WarningBanner />

      <QRCodeDisplay address={qrUri} />

      {address && <CopyAddress address={address} />}

      <DepositLimits
        minimumDeposit={minimumDeposit}
        estimatedArrivalText={estimatedArrivalText}
      />

      {latestEvent && explorerUrl && (
        <DepositStatusBlock
          amount={latestEvent.amount}
          symbol={latestEvent.token}
          pendingCount={pendingCount}
          explorerUrl={explorerUrl}
        />
      )}
    </Box>
  );
};
