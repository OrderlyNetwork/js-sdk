import { FC, useMemo } from "react";
import { VaultsHeaderScript } from "./vaults-header.script";

export const VaultsHeaderDesktop: FC<VaultsHeaderScript> = (props) => {
  const { supportVaults } = props;

  const supportVaultsList = useMemo(() => {
    return (
      <div className="oui-flex oui-items-center">
        {supportVaults.map((chain, index) => (
          <img
            key={chain.chain_id}
            src={`https://oss.orderly.network/static/network_logo/${chain.chain_id}.png`}
            alt={chain.chain_id}
            className="oui-relative oui-size-5"
            style={{
              marginLeft: index > 0 ? "-4px" : "0",
              zIndex: supportVaults.length - index,
            }}
          />
        ))}
      </div>
    );
  }, [supportVaults]);

  return (
    <div className="oui-flex oui-items-center oui-justify-between">
      <div className="oui-flex oui-max-w-[726px] oui-flex-col">
        <div className="oui-flex oui-items-center oui-gap-1 oui-text-[18px] oui-font-normal oui-text-base-contrast-54">
          Available on {supportVaultsList}
        </div>
        <div className="oui-mb-6 oui-mt-8 oui-text-5xl oui-font-bold oui-leading-[44px] oui-text-base-contrast">
          Earn passive yield with vault strategies
        </div>
        <div className="oui-text-xl oui-font-normal oui-text-base-contrast-54">
          Put your idle or extra assets to work effortlessly. Deposit into
          curated vault strategies directly from WOOFi Pro - using USDC from any
          supported blockchain or your WOOFi Pro account, with no gas fees.
        </div>
      </div>
      <div className="oui-h-[238px] oui-w-[360px]">
        <img
          src="/vaults/vaults_img.png"
          alt="logo"
          className="oui-bg-contain oui-bg-center oui-bg-no-repeat"
        />
      </div>
    </div>
  );
};
