"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ExportPopover } from "@/components/theming/builder/exportPopover";
import clsx from "clsx";

export const BuilderNavBar = () => {
  const params = useParams();
  const pathname = usePathname();

  console.log("pathname =====>>>>", pathname);

  return (
    <div
      className={
        "flex justify-between border-0 border-b border-solid border-slate-200"
      }
    >
      <div className="flex gap-3">
        <div>
          <Link
            href={`/dev/theming/${params?.id}/tokens`}
            className={clsx(
              pathname === `/dev/theming/${params?.id}/tokens` &&
                "text-blue-600"
            )}
          >
            Design tokens
          </Link>
        </div>
        <div>
          <Link
            href={`/dev/theming/${params?.id}/components`}
            className={clsx(
              pathname === `/dev/theming/${params?.id}/components` &&
                "text-blue-600"
            )}
          >
            Components
          </Link>
        </div>
        <div>
          <Link href={`/dev/theming/${params?.id}/components`}>
            Base config
          </Link>
        </div>
      </div>
      <div>
        <ExportPopover />
      </div>
    </div>
  );
};
