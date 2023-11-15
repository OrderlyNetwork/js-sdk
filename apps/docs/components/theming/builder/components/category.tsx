"use client";

import clsx from "clsx";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const COMPONENTS = ["Button", "Input", "Select", "Checkbox", "Radio"];

export const ComponentCategory = () => {
  const search = useSearchParams();
  const { id } = useParams()!;

  const tag = search?.get("tag");

  return (
    <div>
      <div className={"py-2 font-bold text-slate-500 flex flex-col"}>
        Base Components
      </div>
      {COMPONENTS.map((component, index) => {
        return (
          <Link
            href={`/dev/theming/${id}/components?tag=${component.toLowerCase()}`}
            key={index}
            className={clsx(
              "block",
              tag === component.toLowerCase() && "text-blue-500"
            )}
          >
            {component}
          </Link>
        );
      })}
      <div className={"py-2 font-bold text-slate-500"}>Block</div>
    </div>
  );
};
