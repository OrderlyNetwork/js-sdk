import Link from "next/link";
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
      <div className="max-w-[90rem] mx-auto pb-10">
        <div className="grid grid-cols-[240px_minmax(900px,_1fr)_200px] gap-5">
          <aside className="h-min-screen overflow-y-auto overflow-x-hidden mt-5">
            <TreeView data={data || []} />
          </aside>
          <main>
            <div className="flex space-x-2 text-gray-500 mt-5">
              <Link href="/" className="after:content-['_↗']">
                @orderly.network
              </Link>
              <Link href="/">@orderly.network</Link>
            </div>
            {children}
          </main>

          <aside></aside>
        </div>
      </div>
    </div>
  );
};
