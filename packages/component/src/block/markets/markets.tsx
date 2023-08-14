import { SearchForm } from "@/block/markets/sections/search";
import { ListView } from "@/listView";
import { MarketListView } from "@/block/markets/sections/listView";

export const Markets = () => {
  return (
    <div>
      <h3 className={"text-[20px] py-3"}>Markets</h3>
      <SearchForm />
      <MarketListView />
    </div>
  );
};
