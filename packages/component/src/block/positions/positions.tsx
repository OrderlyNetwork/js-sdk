import { Divider } from "@/divider";
import { PositionCell } from "./cell";
import { Overview } from "./overview";
import { ListView } from "@/listView";
import { FC } from "react";

interface PositionsViewProps {
  dataSource: any[] | null;
  // actions
  onLimitClose?: (position: any) => void;
  onMarketClose?: (position: any) => void;
  onMarketCloseAll?: () => void;
  loadMore?: () => void;
  isLoading?: boolean;
}

export const PositionsView: FC<PositionsViewProps> = (props) => {
  return (
    <div>
      <Overview onMarketCloseAll={props.onMarketCloseAll} />
      <>
        <ListView.separated<any>
          dataSource={props.dataSource}
          renderItem={(item, index) => {
            return (
              <PositionCell
                item={item}
                onLimitClose={props.onLimitClose}
                onMarketClose={props.onMarketClose}
              />
            );
          }}
          renderSeparator={(item, index) => {
            return <Divider key={index} />;
          }}
          onEndReached={props.loadMore}
        />
      </>
    </div>
  );
};
