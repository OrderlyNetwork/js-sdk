import Button from "@/button";
import { cn } from "@/utils/css";
import { FC, useState } from "react";

const SlippageItem = ({
  value,
  isActive,
}: {
  value: number;
  isActive: boolean;
}) => {
  return (
    <button className={cn("rounded h-[40px] flex items-center justify-center")}>
      <span>{`${value}%`}</span>
    </button>
  );
};

export interface SlippageProps {
  onConfirm: () => Promise<any>;
}

export const Slippage: FC<SlippageProps> = (props) => {
  const [value, setValue] = useState(0.5);
  return (
    <div>
      <div className="grid col-span-4">
        <SlippageItem value={0.1} isActive />
        <SlippageItem value={1} isActive={false} />
        <SlippageItem value={2} isActive={false} />
      </div>
      {/* <div className=""></div> */}
      <Button fullWidth>Confirm</Button>
    </div>
  );
};
