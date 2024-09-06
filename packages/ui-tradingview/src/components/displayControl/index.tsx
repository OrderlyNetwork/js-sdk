import { ReactNode, useRef, useState } from "react";
import { DisplayControlSettingInterface } from "../../type";
import {
  Box,
  Checkbox,
  Divider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Flex,
  Text,
  cn, Switch
} from "@orderly.network/ui";
import { CaretIcon, DisplaySettingIcon } from "../../icons";

const DisplayControlMap: {
  label: string;
  id: keyof DisplayControlSettingInterface;
}[] = [
  {
    label: "Position",
    id: "position",
  },
  // {
  //   label: "Buy/Sell",
  //   id: "buySell",
  // },
  {
    label: "Limit Orders",
    id: "limitOrders",
  },
  {
    label: "Stop orders",
    id: "stopOrders",
  },
  {
    label: "TP/SL",
    id: "tpsl",
  },
  {
    label: "Position TP/SL",
    id: "positionTpsl",
  },
];

interface IProps {
  displayControlState: DisplayControlSettingInterface;
  changeDisplayControlState: (state: DisplayControlSettingInterface) => void;
}

export default function DisplayControl({
  displayControlState,
  changeDisplayControlState,
}: IProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenuRoot open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Flex justify='start' itemAlign='center' className='oui-gap-[2px] oui-cursor-pointer oui-text-base-contrast-36  hover:oui-text-base-contrast-80'>
            <DisplaySettingIcon className={
              cn(
                'oui-w-[18px] oui-h-[18px] ',
                open && 'oui-text-base-contrast-80',
              )} />
            <CaretIcon className={cn(
              'oui-w-3 oui-h-3',
              open && 'oui-text-base-contrast-80 oui-rotate-180',
            )} />
          </Flex>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            align="start"
            sideOffset={20}
            className="oui-bg-base-8"
          >
            <Flex direction='column' gap={4} px={5} py={5} width={240} justify='start' itemAlign='start'>
              {DisplayControlMap.map(item =>
                <Flex key={item.id} justify={'between'} itemAlign={'center'} className='oui-w-full'>
                  <Text className={cn(
                    'oui-text-sm oui-text-base-contrast-80',
                    !displayControlState[item.id] && 'oui-text-base-contrast-36'
                  )}>
                    {item.label}
                  </Text>
                  <Switch
                    className='oui-h-4 oui-w-8'
                    checked={displayControlState[item.id]}
                    onCheckedChange={(checked) => {
                      changeDisplayControlState({
                        ...displayControlState,
                        [item.id]: checked,
                      });
                    }}
                  />
                </Flex>
              )}
            </Flex>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </>
  );
}
