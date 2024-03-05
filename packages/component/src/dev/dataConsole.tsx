import { useEventEmitter } from "@orderly.network/hooks";
import { useEffect, useRef, useState } from "react";
import { Divider } from "..";

export const DebugPrinter = () => {
  const [info, setInfo] = useState();
  const prevInfo = useRef(info);

  const ee = useEventEmitter();

  useEffect(() => {
    (window as any).__ORDERLY__DEBUGER = {};
  }, []);

  useEffect(() => {
    const print = (data: any) => {
      setInfo(data);

      //   const error = new Error();
      //   const stack = error
      //     .stack!.split("\n")
      //     .slice(2)
      //     .map((line) => line.replace(/\s+at\s+/, ""))
      //     .join("\n");
      //   console.log(stack);
    };

    ee.on("print:data", print);

    return () => {
      ee.off("print:data", print);
    };
  }, []);

  // Save the most recent data for comparison
  useEffect(() => {
    setTimeout(() => {
      prevInfo.current = info;
    }, 200);
  }, [info]);

  return (
    <div className="orderly-fixed orderly-left-3 orderly-bottom-10 orderly-min-w-[300px] orderly-bg-base-700/70 orderly-z-50 orderly-rounded !orderly-text-xs orderly-grid orderly-grid-cols-2 orderly-pointer-events-none">
      <div className="orderly-border-r orderly-border-base-500 orderly-p-2">
        <div>Prev</div>
        <pre>{JSON.stringify(prevInfo.current, null, 2)}</pre>
      </div>

      <div className="orderly-p-2">
        <div>New</div>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    </div>
  );
};
