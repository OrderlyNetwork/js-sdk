import { VaultsPage } from "@veltodefi/vaults";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function Vaults() {
  return (
    <div className="orderly-sdk-layout">
      <BaseLayout initialMenu={PathEnum.Vaults}>
        <VaultsPage
          config={{
            headerImage: "/vaults/vaults_img.png",
          }}
        />
      </BaseLayout>
    </div>
  );
}
