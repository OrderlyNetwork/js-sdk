"use client";

import Link from "next/link";
import React from "react";
import { trpc } from "@/utils/trpc";

export const ThemeList = () => {
  const themes = trpc.theme.byBroker.useQuery({
    id: "9f25dcb0-bbbc-4291-9069-9ec1d78e69f5",
  });

  console.log(themes.data);

  return (
    <div>
      <h3 className="text-red-400">theme list</h3>
      <div>
        {themes.data?.map((theme) => (
          <Link href={`/dev/theming/${theme.id}`}>{theme.name}</Link>
        ))}
      </div>
    </div>
  );
};
