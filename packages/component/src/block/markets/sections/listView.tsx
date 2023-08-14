import { ListView } from "@/listView";
import { Divider } from "@/divider";
import { useCallback } from "react";
import { Statistic } from "@/statistic";

interface MarketListViewProps {
  dataSource: any[];
}

export const MarketListView = () => {
  const renderItem = useCallback(() => {
    return (
      <ListView.listTile
        className={"p-0"}
        title={"BTC-PERP"}
        subtitle={"226.33M"}
        avatar={{
          type: "coin",
          name: "BTC",
        }}
        tailing={
          <Statistic label={"24h"} value={"-0.01%"} align={"right"} coloring />
        }
      />
    );
  }, []);

  const renderSeparator = useCallback(() => {
    return <Divider />;
  }, []);

  return (
    <>
      <div className={"flex justify-between text-sm"}>
        <div>Instrument</div>
        <div>Change%</div>
      </div>
      <Divider />
      <ListView.separated
        dataSource={[1, 2]}
        renderItem={renderItem}
        renderSeparator={renderSeparator}
      />
    </>
  );
};
