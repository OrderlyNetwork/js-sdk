import { Flex, Text } from "@orderly.network/ui";
import { FC, SVGProps } from "react";

export type LayoutPosition = "left" | "right";

export type LayoutSwitchProps = {
  layout?: LayoutPosition;
  onLayout?: (layout: LayoutPosition) => void;
};

export const LayoutSwitch: FC<LayoutSwitchProps> = (props) => {
  const { layout, onLayout } = props;
  return (
    <Flex className="oui-gap-x-[6px]" pl={3}>
      <Text size="2xs" intensity={36}>
        layout
      </Text>
      <div
        className="oui-cursor-pointer oui-transition-all"
        onClick={() => {
          onLayout?.(layout === "left" ? "right" : "left");
        }}
      >
        {layout === "left" ? <LeftLayoutIcon /> : <RightLayoutIcon />}
      </div>
    </Flex>
  );
};

export const LeftLayoutIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
      fill="#608CFF"
    />
    <path
      d="M17.813 4C20.107 4 22 5.778 22 8v8c0 2.222-1.893 4-4.187 4H6.188C3.893 20 2 18.222 2 16V8c0-2.222 1.893-4 4.188-4zM8 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
      fill="#282E3A"
    />
  </svg>
);

export const RightLayoutIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.188 4C3.893 4 2 5.778 2 8v8c0 2.222 1.893 4 4.188 4h11.624C20.107 20 22 18.222 22 16V8c0-2.222-1.893-4-4.188-4zM16 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"
      fill="#282E3A"
    />
    <path
      d="M17 7h-1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
      fill="#608CFF"
    />
  </svg>
);
