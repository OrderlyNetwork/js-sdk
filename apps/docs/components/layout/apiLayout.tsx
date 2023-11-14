import { NavBar } from "./navbar";
import { TreeView } from "./tree";

export const ApiLayout = ({
  data,
  children,
}: {
  children: React.ReactNode;
  data?: any;
}) => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto">
        <div className="grid grid-cols-[240px_minmax(900px,_1fr)_200px] gap-5">
          <aside className="h-min-screen overflow-y-auto overflow-x-hidden">
            <TreeView data={data || []} />
          </aside>
          <main>{children}</main>

          <aside>toc</aside>
        </div>
      </div>
    </div>
  );
};
