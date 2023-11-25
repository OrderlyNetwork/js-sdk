import { useDemoContext } from "@/components/demoContext";
import { useMarketsStream } from "@orderly.network/hooks";
import { Markets } from "@orderly.network/react";

export const MarketsComponent = () => {
  const { data } = useMarketsStream();
  const { onSymbolChange } = useDemoContext();
  return <Markets dataSource={data} onItemClick={onSymbolChange} />;
};
