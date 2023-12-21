import { useDemoContext } from "@/components/demoContext";
import { useMarketsStream } from "@orderly.network/hooks";
import { Markets, MarketsFull } from "@orderly.network/react";

export const MarketsComponent = () => {
  const { data } = useMarketsStream();
  const { onSymbolChange } = useDemoContext();
  return <Markets dataSource={data} onItemClick={onSymbolChange} />;
};

export const MarketsComponentFull = () => {
  const { data } = useMarketsStream();
  const { onSymbolChange } = useDemoContext();
  return (
    <div className="py-5">
      <MarketsFull dataSource={data} onItemClick={onSymbolChange} />
    </div>
  );
};
