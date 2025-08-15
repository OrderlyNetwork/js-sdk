import { FC } from "react";
import { Text, cn } from "@orderly.network/ui";

const ProcessDot = () => {
  return <div className="oui-size-2 oui-rounded-full oui-bg-white/[0.54]" />;
};

const ProcessLine = () => {
  return <div className="oui-h-px oui-flex-1 oui-bg-white/[0.2]" />;
};

const ProcessText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "oui-flex-1 oui-text-2xs oui-font-normal oui-text-base-contrast-80",
        className,
      )}
    >
      {children}
    </div>
  );
};

const WithdrawProcess: FC = () => {
  return (
    <>
      <div className="oui-flex oui-items-center">
        <ProcessDot />
        <div className="oui-flex-1">
          <ProcessLine />
        </div>
        <ProcessDot />
        <div className="oui-flex-1">
          <ProcessLine />
        </div>
        <ProcessDot />
      </div>
      <div className="oui-mt-1 oui-flex oui-justify-between">
        <ProcessText>Initiate</ProcessText>
        <ProcessText className="oui-text-center">Vault process</ProcessText>
        <ProcessText className="oui-text-right">Transferred</ProcessText>
      </div>
    </>
  );
};

export const WithdrawProcessWidget: FC = () => {
  return (
    <div className="oui-flex oui-flex-col oui-gap-2 oui-rounded-xl oui-border oui-border-white/[0.12] oui-p-3">
      <div className="oui-flex oui-items-center oui-justify-between oui-text-sm oui-font-semibold oui-text-base-contrast-54">
        <div>Withdraw process</div>
        <Text color="primary">Up to 6 hours</Text>
      </div>
      <WithdrawProcess />
    </div>
  );
};
