import * as React from "react";
import { Text } from "../typography/text";

import {
  CaretLeftIcon,
  CaretRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icon";

import { ButtonProps, buttonVariants } from "../button";
import { cnBase } from "tailwind-variants";
import { Select } from "../select";
import { Flex } from "../flex";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cnBase(
      "oui-mx-auto oui-flex oui-w-full oui-justify-center oui-text-xs oui-items-center",
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
      "oui-min-w-6",
      buttonVariants({
        size: "xs",
        variant: isActive ? "contained" : "text",
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
    className={cnBase("oui-gap-1 oui-pl-2.5", className)}
    {...props}
  >
    <ChevronLeftIcon className="oui-h-4 oui-w-4" color="white" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cnBase("oui-gap-1 oui-pr-2.5", className)}
    {...props}
  >
    <ChevronRightIcon className="oui-h-4 oui-w-4" color="white" />
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

const Paginations = (props: {
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: string) => void;
  pageSize?: number;
  page: number;
  count: number;
}) => {
  const pages = Array.from({ length: props.count }, (_, i) => i + 1);

  return (
    <Pagination>
      <Flex mr={4}>
        <Text
          as="div"
          className="oui-text-nowrap oui-mr-2 oui-text-base-contrast-54"
        >
          Rows per page
        </Text>
        <div className={"oui-w-16"}>
          <Select.options
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
            ]}
            value="5"
            size="xs"
            onValueChange={props.onPageSizeChange}
          />
        </div>
      </Flex>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink isActive={page === props.page} href="#" key={page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem> */}
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export {
  Paginations,
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
