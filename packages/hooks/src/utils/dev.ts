import { EventEmitter, SimpleDI } from "@veltodefi/core";
import { getGlobalObject } from "@veltodefi/utils";

const __ORDERLY__DEBUGER_TAG = "__ORDERLY__DEBUGER";

function debugPrint(msg: any): void;
function debugPrint(msg: any, tag?: string) {
  tag = `${__ORDERLY__DEBUGER_TAG}:${tag} `;
  if (!(getGlobalObject() as any).__ORDERLY__DEBUGER) {
    console.log("${tag}${msg}");
    // console.info(
    //   "You can add `DebugPrinter` component to see the data in your UI"
    // );
  }

  let ee = SimpleDI.get<EventEmitter>("EE");

  if (ee && msg) {
    ee.emit("print:data", msg);
  }
}

if (typeof window !== "undefined") {
  (window as any).debugPrint = debugPrint;
}
