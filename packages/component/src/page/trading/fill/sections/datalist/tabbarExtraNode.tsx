import { useEffect, useState } from "react";
import { Checkbox } from "@/checkbox";
import { Label } from "@/label";
import { Settings } from "lucide-react";
import { useSessionStorage } from "@orderly.network/hooks";
import { useTabContext } from "@/tab/tabContext";

export const TabBarExtraNode = () => {
  const [showAllSymbol, setShowAllSymbol] = useSessionStorage(
    "showAllSymbol_position",
    true
  );

  const { updateData } = useTabContext();

  // const [symbol, setSymbol] = useState(() =>
  //   showAllSymbol ? "" : context.symbol
  // );

  const onShowAllSymbolChange = (isAll: boolean) => {
    // setSymbol(isAll ? "" : context.symbol);
    setShowAllSymbol(isAll);
    updateData("showAllSymbol", isAll);
  };

  useEffect(() => updateData("showAllSymbol", showAllSymbol), []);

  // const onChecked = (checked: boolean) => {
  //   console.log(checked);
  // };
  return (
    <div className={"orderly-flex orderly-items-center orderly-gap-2"}>
      <div className={"orderly-flex orderly-items-center orderly-gap-2"}>
        <Checkbox
          id={"showAll"}
          checked={showAllSymbol}
          onCheckedChange={onShowAllSymbolChange}
        />
        <Label
          htmlFor={"showAll"}
          className="orderly-text-base-contrast-54 orderly-text-3xs"
        >
          Show all instruments
        </Label>
      </div>
      <button className={"orderly-text-base-contrast-80"}>
        <Settings size={18} />
      </button>
    </div>
  );
};
