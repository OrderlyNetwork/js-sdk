import { BrokerListView } from "./listView";
import { CreateBrokerForm } from "@/components/admin/broker/createForm";
import { Creator } from "@/components/admin/broker/creator";

export default function Page() {
  return (
    <>
      <BrokerListView />
      <Creator />
    </>
  );
}
