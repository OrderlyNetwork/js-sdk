import { NavBar } from "./navbar";
import { TreeView } from "./tree";
import { useDetailsPageContext } from "../api/detailPageProvider";
import { ChevronRight } from "lucide-react";

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
        <div className="grid grid-cols-[240px_minmax(900px,_1fr)_200px] gap-5">
          <aside className="h-min-screen overflow-y-auto overflow-x-hidden mt-5">
            <TreeView data={data || []} />
          </aside>
          <main className="mt-5">
            {moduleName && apiName && (
              <div className="flex space-x-2 text-gray-500 items-center">
                {moduleName}
                <ChevronRight size={16} />
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
