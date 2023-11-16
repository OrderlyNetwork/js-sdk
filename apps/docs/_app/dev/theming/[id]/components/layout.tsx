import React from "react";
import { ComponentCategory } from "@/components/theming/builder/components/category";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div className={"flex"}>
      <div className={"border-r border-solid w-[200px]"}>
        <ComponentCategory />
      </div>
      <div>{children}</div>
    </div>
  );
}
