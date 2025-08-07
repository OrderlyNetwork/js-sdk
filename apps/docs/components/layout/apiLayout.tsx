import { ChevronRight } from "lucide-react";
import { EMPTY_LIST } from "@orderly.network/types";
import { useDetailsPageContext } from "../api/detailPageProvider";
import { NavBar } from "./navbar";
import { TreeView } from "./tree";

export const ApiLayout = ({
  data,
  children,
}: {
  children: React.ReactNode;
  data?: any;
}) => {
  const { moduleName, apiName } = useDetailsPageContext();

  return (
    <div>
      <NavBar />
      <div className="max-w-[90rem] mx-auto pb-10">
        <div className="grid grid-cols-[280px_minmax(900px,_1fr)] gap-7">
          <aside
            className="overflow-y-auto overflow-x-hidden sticky top-[65px] text-base-contrast-54"
            style={{ maxHeight: "calc(100vh - 65px)" }}
          >
            <TreeView data={data || EMPTY_LIST} />
          </aside>
          <main className="mt-5">
            {moduleName && apiName && (
              <div className="flex space-x-1 text-gray-500 items-center">
                <span>{moduleName}</span>
                <ChevronRight size={14} className="mt-1" />
                <span className="font-medium">{apiName}</span>
              </div>
            )}

            {children}
          </main>

          <aside></aside>
        </div>
      </div>
    </div>
  );
};
