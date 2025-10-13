import { useState } from "react";
import { useTrack } from "@kodiak-finance/orderly-hooks";
import { TrackerEventName } from "@kodiak-finance/orderly-types";
import { cn, Flex } from "@kodiak-finance/orderly-ui";
import { ProductItem } from "./productItem";

export function CustomProductNav() {
  const items = [
    { name: "Swap", href: "/swap" },
    { name: "Perps", href: "/perps" },
  ];
  const { track } = useTrack();
  const [currentItem, setCurrentItem] = useState<string>("/perps");

  const onItemClick = (item: ProductItem) => {
    if (item.href === "/swap") {
      // swap url
      track(TrackerEventName.trackCustomEvent, {
        eventName: "portfolio_fee_tier_click_stake_woo",
      });

      // track(TrackerEventName.trackCustomEvent, { eventName: 'sign_message_success'})
      // track(TrackerEventName.clickLinkDeviceButton, {'test': 'test', eventName: 'portfolio_fee_tier_click_stake_woo'})
      // window.open("https://app.orderly.network", "_blank");
      return;
    }
  };

  return (
    <Flex gap={0} border r="md" className={cn("oui-p-px")} borderColor={12}>
      {items?.map((product, index) => {
        return (
          <ProductItem
            key={index}
            item={product}
            onClick={onItemClick}
            active={currentItem == product.href}
          />
        );
      })}
    </Flex>
  );
}
