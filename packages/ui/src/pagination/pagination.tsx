import * as React from "react";
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   DotsHorizontalIcon,
// } from "@radix-ui/react-icons"
//
import { CaretLeftIcon, CaretRightIcon } from "../icon";

import { ButtonProps, buttonVariants } from "../button";
import { cnBase } from "tailwind-variants";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cnBase(
      "oui-mx-auto oui-flex oui-w-full oui-justify-center",
      className
    )}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cnBase(
      "oui-flex oui-flex-row oui-items-center oui-gap-2",
      className
    )}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cnBase("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  // size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cnBase(
      buttonVariants({
        variant: isActive ? "outlined" : "text",
        // size,
      })
      // className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cnBase("oui-gap-1 oui-pl-2.5", className)}
    {...props}
  >
    <CaretLeftIcon className="oui-h-4 oui-w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cnBase("oui-gap-1 oui-pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <CaretRightIcon className="oui-h-4 oui-w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cnBase(
      "oui-flex oui-h-9 oui-w-9 oui-items-center oui-justify-center",
      className
    )}
    {...props}
  >
    {/* <DotsHorizontalIcon className="h-4 w-4" /> */}
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
