import { VaultsPage } from "@orderly.network/vaults";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function Vaults() {
  return (
    <div className="orderly-sdk-layout">
      <BaseLayout initialMenu={PathEnum.Vaults}>
        <VaultsPage />
      </BaseLayout>
    </div>
  );
}
