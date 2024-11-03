import { FC, PropsWithChildren, SVGProps, useState } from "react";
import {
  CloseIcon,
  cn,
  Divider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
} from "@orderly.network/ui";

export type LayoutPosition = "left" | "right";

export type SwitchLayoutProps = {
  layout?: LayoutPosition;
  onLayout?: (layout: LayoutPosition) => void;
};

export const SwitchLayout: FC<SwitchLayoutProps> = (props) => {
  return (
    <SwitchLayoutDropDown {...props}>
      <Flex
        className={cn(
          "oui-rounded-md",
          "oui-w-[69px] oui-h-[28px]",
          "oui-cursor-pointer oui-transition-all",
          "oui-bg-base-4 oui-text-base-contrast-80"
        )}
        gapX={1}
        justify="center"
        itemAlign="center"
      >
        <LayoutIcon />
        <Text size="2xs" weight="semibold">
          layout
        </Text>
      </Flex>
    </SwitchLayoutDropDown>
  );
};

export const SwitchLayoutDropDown: FC<PropsWithChildren<SwitchLayoutProps>> = (
  props
) => {
  const [open, setOpen] = useState(false);
  const content = (
    <>
      <Flex
        itemAlign="center"
        justify="between"
        mt={3}
        className="oui-mb-[10px]"
      >
        <Text size="base" intensity={98}>
          layout
        </Text>
        <CloseIcon
          size={16}
          className="oui-text-base-contrast-80 oui-cursor-pointer"
          opacity={0.98}
          onClick={() => {
            setOpen(false);
          }}
        />
      </Flex>
      <Divider />
      <Flex gapX={6} mt={5}>
        <Flex
          direction="column"
          gapY={2}
          onClick={() => {
            props.onLayout?.("left");
          }}
        >
          <LeftLayoutIcon
            className={cn(
              "oui-w-[140px]",
              "oui-text-base-10 oui-rounded-[10px]",
              "oui-border-[4px] oui-border-base-5 hover:oui-border-primary-light",
              props.layout === "left" && "!oui-border-primary-light"
            )}
          />
          <Text size="2xs" intensity={54}>
            Advanced (Right)
          </Text>
        </Flex>

        <Flex
          direction="column"
          gapY={2}
          onClick={() => {
            props.onLayout?.("right");
          }}
        >
          <RightLayoutIcon
            className={cn(
              "oui-text-base-10 oui-rounded-[10px]",
              "oui-border-[4px] oui-border-base-5 hover:oui-border-primary-light",
              props.layout === "right" && "!oui-border-primary-light"
            )}
          />
          <Text size="2xs" intensity={54}>
            Advanced (Left)
          </Text>
        </Flex>
      </Flex>
    </>
  );

  return (
    <DropdownMenuRoot open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          align="end"
          className={cn(
            "oui-bg-base-8 oui-p-5 oui-pt-0 oui-w-[360px] oui-font-semibold"
          )}
        >
          {content}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export const LayoutIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3.832 1.994c-.736 0-1.333.597-1.333 1.333v9.334c0 .737.597 1.333 1.333 1.333H6.5c.737 0 1.333-.596 1.333-1.333V3.327c0-.736-.596-1.333-1.333-1.333zm6.667 0c-.737 0-1.333.597-1.333 1.333v2.667c0 .737.596 1.333 1.333 1.333h2.667c.736 0 1.333-.596 1.333-1.333V3.327c0-.736-.597-1.333-1.333-1.333zm.437 6.679a2.7 2.7 0 0 0-1.033.607.284.284 0 0 0-.061.339c.222.411-.01.851-.512.876a.29.29 0 0 0-.26.217c-.05.207-.07.38-.07.608 0 .19.02.407.06.599a.28.28 0 0 0 .252.217c.506.044.756.429.53.92a.28.28 0 0 0 .06.321c.296.273.635.466 1.034.59a.285.285 0 0 0 .312-.104c.31-.427.757-.428 1.05 0a.28.28 0 0 0 .313.113 2.8 2.8 0 0 0 1.042-.599.28.28 0 0 0 .06-.33c-.23-.466.035-.894.513-.902a.28.28 0 0 0 .269-.209c.048-.199.06-.372.06-.616q0-.316-.069-.616a.276.276 0 0 0-.27-.217c-.469-.001-.732-.463-.502-.868a.27.27 0 0 0-.053-.339 2.8 2.8 0 0 0-1.059-.607.274.274 0 0 0-.312.112c-.268.417-.77.425-1.033.009a.284.284 0 0 0-.321-.121m.842 1.536a1.111 1.111 0 1 1 0 2.222 1.111 1.111 0 0 1 0-2.222" />
  </svg>
);

export const LeftLayoutIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="148"
    height="100"
    viewBox="0 0 148 100"
    fill="currentColor"
    {...props}
  >
    <rect
      x="2"
      y="2"
      width="144"
      height="96"
      // rx="10"
      // fill="#07080A"
      // stroke="#282E3A"
      // stroke-width="4"
    />
    <rect x="104" y="8" width="36" height="17" rx="2" fill="#181C23" />
    <rect x="104" y="27" width="36" height="54" rx="2" fill="#181C23" />
    <rect x="104" y="83" width="36" height="9" rx="2" fill="#181C23" />
    <rect x="107" y="87" width="30" height="1" rx=".5" fill="url(#a)" />
    <rect x="107" y="30" width="14" height="6" rx="2" fill="#008676" />
    <rect x="123" y="30" width="14" height="6" rx="2" fill="#D92D6B" />
    <rect x="107" y="19" width="14" height="3" rx="1.5" fill="#333948" />
    <rect x="123" y="19" width="14" height="3" rx="1.5" fill="#335FFC" />
    <rect x="107" y="70" width="30" height="8" rx="2" fill="#008676" />
    <defs>
      <linearGradient
        id="a"
        x1="137"
        y1="87.5"
        x2="107"
        y2="87.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#59B0FE" />
        <stop offset="1" stop-color="#26FEFE" />
      </linearGradient>
    </defs>
  </svg>
);

export const RightLayoutIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="148"
    height="100"
    viewBox="0 0 148 100"
    fill="currentColor"
    {...props}
  >
    <rect
      x="2"
      y="2"
      width="144"
      height="96"
      // rx="10"
      fill="currentColor"
      // stroke="#282E3A"
      // stroke-width="4"
    />
    <rect x="8" y="8" width="36" height="17" rx="2" fill="#181C23" />
    <rect x="8" y="27" width="36" height="54" rx="2" fill="#181C23" />
    <rect x="8" y="83" width="36" height="9" rx="2" fill="#181C23" />
    <rect
      x="11"
      y="87"
      width="30"
      height="1"
      rx="0.5"
      fill="url(#paint0_linear_17214_42014)"
    />
    <rect x="11" y="30" width="14" height="6" rx="2" fill="#008676" />
    <rect x="27" y="30" width="14" height="6" rx="2" fill="#D92D6B" />
    <rect x="11" y="19" width="14" height="3" rx="1.5" fill="#333948" />
    <rect x="27" y="19" width="14" height="3" rx="1.5" fill="#335FFC" />
    <rect x="11" y="70" width="30" height="8" rx="2" fill="#008676" />
    <defs>
      <linearGradient
        id="paint0_linear_17214_42014"
        x1="41"
        y1="87.5"
        x2="11"
        y2="87.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#59B0FE" />
        <stop offset="1" stop-color="#26FEFE" />
      </linearGradient>
    </defs>
  </svg>
);
