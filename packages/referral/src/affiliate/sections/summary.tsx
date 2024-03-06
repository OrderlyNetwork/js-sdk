import { HistoryIcon } from "../icons/history";
import { TriangleDownIcon } from "../icons/triangleDown";

export const Summary = () => {

    return (
        <div className="orderly-p-6">
            <div className="orderly-flex orderly-justify-between">
                <span>Summary</span>
                <div className="orderly-flex orderly-items-center orderly-justify-between orderly-gap-2 orderly-px-2 orderly-py-[6px]">
                    <HistoryIcon />
                    <span>All</span>
                    <TriangleDownIcon />
                </div>
            </div>
        </div>
    );
}