import { TPSLListView } from "@/block/tp_sl/tpsl_listview";
import { FC, useContext } from "react";
import { TabContext } from "@/tab";
import { Divider } from "@/divider";
import { Header } from "@/block/orders/full/header";
import { API } from "@orderly.network/types";

export const TPSLList: FC<{
  dataSource: API.AlgoOrder[];
}> = (props) => {
  const { height } = useContext(TabContext);
  return (
    <div>
      {/*<Header*/}
      {/*    count={ 0}*/}
      {/*    // onSideChange={props.onSideChange}*/}
      {/*    // side={props.side}*/}
      {/*    // status={props.status}*/}
      {/*/>*/}
      <Divider />
      <div
        className="orderly-relative"
        style={{ height: `${(height?.content ?? 300) - 55}px` }}
      >
        <TPSLListView dataSource={[]} />
      </div>
    </div>
  );
};
