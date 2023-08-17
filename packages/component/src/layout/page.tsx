import { FC, HTMLAttributes, PropsWithChildren } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/css";

// const pageVariants = cva([],{
//   variants: {
//
//   }
// });

export interface PageProps extends HTMLAttributes<HTMLDivElement> {}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  return (
    <div
      className={cn("bg-background text-background-contrast", props.className)}
    >
      {props.children}
    </div>
  );
};
