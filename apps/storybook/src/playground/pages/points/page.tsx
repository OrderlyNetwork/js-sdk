import { PointSystemPage } from "@orderly.network/trading-points";
import { useRouteContext } from "../../../components/orderlyProvider/rounteProvider";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function PointSystem() {
  const { onRouteChange } = useRouteContext();
  return (
    <div className="orderly-sdk-layout">
      <BaseLayout initialMenu={PathEnum.Points}>
        <PointSystemPage onRouteChange={onRouteChange} />
      </BaseLayout>
    </div>
  );
}
