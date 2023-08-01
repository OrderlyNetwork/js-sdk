"use client";

import { CreateBrokerForm } from "./createForm";
import { trpc } from "@/utils/trpc";

export const Creator = () => {
  const broker = trpc.broker.add.useMutation();

  const onSubmit = (data: any) => {
    broker.mutate(data);
  };

  return <CreateBrokerForm onSubmit={onSubmit} />;
};
