import { useQuery } from "../useQuery";

export type Brokers = {
  [key: string]: string;
}

export const useAllBrokers = () => {

  const { data } = useQuery<Brokers | undefined>("/v1/public/broker/name", {
    formatter: (res) => {
      const { rows } = res;

      return rows
        ?.map((item: any) => ({ [item.broker_id]: item.broker_name }))
        .reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
    },
  });

  return [data] as const;
};
