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
          "--oui-gradient-primary-darken-stop-start": "26%",
          "--oui-gradient-primary-darken-stop-end": "80%",
          // "--oui-gradient-primary-darken-start": "var(--oui-gradient-primary-darken-end)",
          // "--oui-gradient-primary-darken-end": "var(--oui-gradient-primary-darken-start)",
        }}
        onClick={props.onItemClick}
        classNames={{
          navItem: cn("oui-gradient-primary-darken oui-text-white", props.className),
        }}
      />
      <Divider direction="vertical" className="oui-h-8" intensity={8} />
    </>
  );
};
