"use client";

import { trpc } from "@/utils/trpc";

export const BrokerListView = () => {
  const brokers = trpc.broker.list.useQuery();

  return <div>ListView</div>;
};
