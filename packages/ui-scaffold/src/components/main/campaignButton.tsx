import { Divider } from "@orderly.network/ui";
import { MainNavItem, NavItem } from "./navItem";
import { cn } from "@orderly.network/ui";

export type CampaignProps = {
  item: MainNavItem;
  className?: string;
  onItemClick?: (item: MainNavItem[]) => void;
  current?: string[];
  // classNames?: MainNavClassNames;
};

export const CampaignButton = (props: CampaignProps) => {
  return (
    <>
      <NavItem
        item={props.item}
        style={{
          // @ts-ignore
          "--oui-gradient-angle": "188deg",
          "--oui-gradient-primary-stop-start": "26%",
          "--oui-gradient-primary-stop-end": "80%",
          // "--oui-gradient-primary-start": "var(--oui-gradient-primary-end)",
          // "--oui-gradient-primary-end": "var(--oui-gradient-primary-start)",
        }}
        onClick={props.onItemClick}
        classNames={{
          navItem: cn("oui-gradient-primary oui-text-white", props.className),
        }}
      />
      <Divider direction="vertical" className="oui-h-8" intensity={8} />
    </>
  );
};
