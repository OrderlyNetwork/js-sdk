import { DataTable } from "@orderly.network/ui";
import { useColumn } from "./useColumn";
import { API } from "@orderly.network/types";

type Props = {
  dataSource?: API.PositionTPSLExt[];
};

export const Positions = (props: Props) => {
  const column = useColumn();
  return (
    <div>
      <DataTable<API.PositionTPSLExt>
        id="oui-desktop-positions-content"
        classNames={{
          header: "oui-text-base-contrast-36",
          body: "oui-text-base-contrast-80",
        }}
        columns={column}
        dataSource={props.dataSource}
      />
    </div>
  );
};
