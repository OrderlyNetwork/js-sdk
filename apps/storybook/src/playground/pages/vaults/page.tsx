import { VaultsPage } from "@orderly.network/vaults";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function Vaults() {
  return (
    <div className="oui-sdk-layout">
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
