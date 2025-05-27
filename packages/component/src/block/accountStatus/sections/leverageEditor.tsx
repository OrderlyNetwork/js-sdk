import { FC, useMemo, useState } from "react";
import { useLeverage } from "@orderly.network/hooks";
import { Slider } from "@/slider";
import { toast } from "@/toast";

interface LeverageEditorProps {
  // onChange:(value:number)=>void
  // value:number
  onSave?: (value: { leverage: number }) => Promise<any>;
  maxLeverage?: number;
  leverageLevers: number[];
}

export const LeverageEditor: FC<LeverageEditorProps> = (props) => {
  const { maxLeverage, leverageLevers, onSave } = props;

  const [leverage, setLeverage] = useState(() => maxLeverage ?? 0);

  const leverageValue = useMemo(() => {
    const index = leverageLevers.findIndex((item) => item === leverage);

    return index;
  }, [leverage, leverageLevers]);

  return (
    <Slider
      min={0}
      max={leverageLevers.length - 1}
      color={"primary"}
      markLabelVisible
      value={[leverageValue]}
      showTip={false}
      // markCount={5}
      marks={leverageLevers.map((item: number) => ({
        value: item,
        label: `${item}x`,
      }))}
      onValueChange={(value) => {
        // console.log("value", value);
        const _value = leverageLevers[value[0]];
        setLeverage(_value);
      }}
      onValueCommit={(value) => {
        const _value = leverageLevers[value[0]];
        // setLeverage(_value);
        onSave?.({ leverage: _value }).catch((err) => {
          setLeverage(maxLeverage ?? 1);
        });
      }}
    />
  );
};
