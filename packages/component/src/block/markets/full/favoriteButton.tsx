import { API } from "@orderly.network/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { FC, useCallback, useEffect, useState } from "react";
import { Numeral, Text } from "@/text";
import { CircleCloseIcon, CloseIcon, NetworkImage } from "@/icon";
import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { cn } from "@/utils/css";
import { CheckIcon, UncheckIcon, CircleAdd } from "@/icon";
// @ts-ignore
import { FavoriteTab } from "@orderly.network/hooks";
import { Input } from "@/input";
import Button from "@/button";

export interface FavoriteButtonProps {
  symbol: API.MarketInfoExt;
  tabs: FavoriteTab[];
  updateFavoriteTabs: (
    tab: any,
    operator?: {
      add?: boolean;
      update?: boolean;
      delete?: boolean;
    }
  ) => void;
  updateSymbolFavoriteState: (
    symbol: API.MarketInfoExt,
    tab: any,
    del: boolean
  ) => void;
}
export const FavoriteButton: FC<FavoriteButtonProps> = (props) => {
  const { symbol, tabs, updateFavoriteTabs, updateSymbolFavoriteState } = props;

  // @ts-ignore
  const isFavorite = symbol.isFavorite;

  const [open, setOpen] = useState(false);
  /// [{name: string, id: number}]
  const [innerTabs, setInnerTabs] = useState(tabs);
  /// [{name: string, id: number}]
  const [symbolTabs, setSymbolTabs] = useState(
    (symbol as any).tabs as FavoriteTab[]
  );

  const onComfirm = useCallback(() => {
    updateFavoriteTabs(innerTabs);
    // if tab is arrary, the del params is not work
    // if tab is empty array, will be delete, otherwise will be override
    updateSymbolFavoriteState(symbol, symbolTabs, false);
    setOpen(false);
  }, [innerTabs, symbol, symbolTabs]);

  useEffect(() => {
    setInnerTabs(tabs);
  }, [tabs]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <button className="orderly-flex orderly-items-center orderly-mr-1">
          {isFavorite ? <FavoriteIcon /> : <UnFavoriteIcon />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="start"
        sideOffset={20}
        className="orderly-bg-base-800 orderly-w-[340px] orderly-py-[16px] orderly-px-[20px]"
      >
        <FavoriteDropdownContent
          symbol={symbol}
          symbolTabs={symbolTabs}
          setSymbolTabs={setSymbolTabs}
          innerTabs={innerTabs}
          setInnerTabs={setInnerTabs}
        />
        <div className="orderly-absolute orderly-right-5 orderly-top-3 orderly-rounded-sm orderly-opacity-70 orderly-ring-offset-base-700 orderly-transition-opacity hover:orderly-opacity-100 focus:orderly-outline-none focus:orderly-ring-2 focus:orderly-ring-ring focus:orderly-ring-offset-2 disabled:orderly-pointer-events-none data-[state=open]:orderly-bg-accent data-[state=open]:orderly-text-muted-foreground">
          <button
            onClick={(e) => {
              setOpen(false);
              e.stopPropagation();
            }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="orderly-mt-4 orderly-h-[32px] orderly-flex orderly-items-center orderly-gap-2">
          <Button
            color="tertiary"
            fullWidth
            onClick={(e) => {
              setOpen(false);
              e.stopPropagation();
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={(e) => {
              onComfirm();
              e.stopPropagation();
            }}
          >
            Confirm
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FavoriteDropdownContent: FC<{
  symbol: API.MarketInfoExt;
  symbolTabs: FavoriteTab[];
  setSymbolTabs: any;
  innerTabs: FavoriteTab[];
  setInnerTabs: any;
}> = (props) => {
  const { symbol, symbolTabs, setSymbolTabs, innerTabs, setInnerTabs } = props;

  const onItemClick = useCallback(
    (tab: FavoriteTab) => {
      var index = symbolTabs.findIndex((item) => item.id === tab.id);
      var newSymbolTabs = [...symbolTabs];
      if (index === -1) {
        newSymbolTabs.push(tab);
      } else {
        newSymbolTabs.splice(index, 1);
      }
      setSymbolTabs(newSymbolTabs);
    },
    [symbolTabs, innerTabs]
  );

  return (
    <div>
      <div className="orderly-text-xs orderly-text-base-contrast orderly-items-center orderly-flex">
        <span className="orderly-mr-1">Select watchlists for</span>
        <NetworkImage
          type="symbol"
          symbol={symbol.symbol}
          size={"small"}
          className="orderly-mr-2"
        />
        <Text rule="symbol">{symbol.symbol}</Text>
      </div>
      <Divider className="orderly-pt-[17px] orderly-pb-[8px]" />

      <FavoriteTabsListView
        dataSource={innerTabs}
        symbolTabs={symbolTabs}
        // @ts-ignore
        onItemClick={onItemClick}
      />
      <AddNewFavoriteTab
        addNewTab={(tabName: string) => {
          const newTabs = [...innerTabs];
          const tab = { name: tabName, id: Date.now() };
          newTabs.splice(1, 0, tab);
          setInnerTabs(newTabs);
          onItemClick(tab);
        }}
      />
    </div>
  );
};

const FavoriteTabsListView: FC<{
  dataSource: FavoriteTab[];
  symbolTabs: FavoriteTab[];
  onItemClick: (tab: string) => void;
}> = (props) => {
  const renderItem = (
    item: FavoriteTab,
    index: number,
    tabs: FavoriteTab[]
  ) => {
    const selected = tabs.findIndex((tab) => tab.id === item.id) !== -1;

    return (
      <button
        onClick={(e) => {
          // @ts-ignore
          props.onItemClick?.(item);
          e.stopPropagation();
        }}
        className="orderly-w-full"
      >
        <div
          className={cn(
            "orderly-flex orderly-items-center orderly-py-3 orderly-px-2 orderly-cursor-pointer orderly-h-[40px] hover:orderly-bg-base-700 orderly-text-base-contrast-80 orderly-text-xs"
          )}
        >
          {selected ? <CheckIcon size={20} /> : <UncheckIcon size={20} />}
          <span className="orderly-pl-2">{item.name}</span>
        </div>
      </button>
    );
  };

  return (
    <ListView<FavoriteTab, FavoriteTab[]>
      dataSource={props.dataSource}
      // @ts-ignore
      renderItem={renderItem}
      className="orderly-text-xs orderly-overflow-y-auto orderly-min-h-[40px]"
      contentClassName="orderly-space-y-0 orderly-pb-[1px]"
      extraData={props.symbolTabs}
      style={{ maxHeight: `${200}px` }}
    />
  );
};

const AddNewFavoriteTab: FC<{
  addNewTab: (tabName: string) => void;
}> = (props) => {
  const [enter, setEnter] = useState(false);
  const [tabName, setTabName] = useState("");

  if (!enter) {
    return (
      <button
        className="orderly-mt-3 orderly-h-[40px] orderly-w-full orderly-flex orderly-items-center orderly-py-3 orderly-px-2 orderly-text-xs orderly-text-base-contrast-36 hover:orderly-text-base-contrast orderly-fill-base-contrast-36 hover:orderly-fill-base-contrast"
        onClick={(e) => {
          setEnter(true);
          e.stopPropagation();
        }}
      >
        <CircleAdd size={16} fill="current" />
        <span className="orderly-px-2">Add a new watchlist</span>
      </button>
    );
  }

  return (
    <div className="orderly-rounded-md orderly-mt-3 orderly-bg-base-700 orderly-h-[40px] orderly-w-full orderly-flex orderly-items-center">
      <input
        className="orderly-outline-none orderly-h-full orderly-bg-transparent orderly-w-full orderly-px-3"
        autoFocus
        // value={props.newTabName}
        value={tabName}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          // props.setNewTabName(e.target.value);
          setTabName(e.target.value);
        }}
      />
      <span className="orderly-flex orderly-items-center">
        <button
          className="orderly-text-base-contrast-20 hover:orderly-text-base-contrast-80 orderly-pr-2"
          onClick={(e) => {
            e.stopPropagation();
            setEnter(false);
            props.addNewTab(tabName);
            setTabName("");
          }}
        >
          Add
        </button>

        <button
          className="orderly-items-center orderly-pr-2"
          onClick={(e) => {
            setEnter(false);
            setTabName("");
            e.stopPropagation();
          }}
        >
          <CircleCloseIcon
            size={16}
            fill="current"
            fillOpacity={1}
            className="orderly-fill-white/30 hover:orderly-fill-white/90"
          />
        </button>
      </span>
    </div>
  );
};

interface Props {
  width?: number;
  height?: number;
}

export const UnFavoriteIcon: FC<Props> = (props) => {
  const { width = 16, height = 16 } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${width}px`}
      height={`${height}px`}
    >
      <path
        d="M6.92004 2.00779L6.92004 2.00779L5.36329 5.16211L1.88229 5.66793C1.19877 5.76725 0.925845 6.60722 1.42044 7.08934L3.93932 9.54463L3.34469 13.0116C3.22793 13.6923 3.94246 14.2115 4.55382 13.89L7.66732 12.2532L10.7808 13.89C11.3922 14.2115 12.1067 13.6923 11.9899 13.0116L11.3953 9.54463L13.9142 7.08934C14.4088 6.60722 14.1359 5.76725 13.4523 5.66793L9.97135 5.16211L8.4146 2.00779L8.4146 2.00779C8.10892 1.38842 7.22572 1.38842 6.92004 2.00779Z"
        stroke="white"
        stroke-opacity="0.54"
        strokeWidth="1.33333"
        fill="rgba(29, 26, 38, 1)"
      />
    </svg>
  );
};

export const FavoriteIcon: FC<Props> = (props) => {
  const { width = 16, height = 16 } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${width}px`}
      height={`${height}px`}
    >
      <path
        d="M6.81677 1.30283L7.17547 1.1258C6.96761 0.704632 6.36703 0.704633 6.15917 1.1258L6.51318 1.30052L6.15917 1.1258L4.54037 4.40584L0.920634 4.93182C0.455843 4.99936 0.270253 5.57054 0.60658 5.89838L3.22585 8.45153L2.60752 12.0566C2.52813 12.5196 3.014 12.8726 3.42973 12.654L6.66732 10.9519L9.90491 12.654C10.3206 12.8726 10.8065 12.5196 10.7271 12.0566L10.1088 8.45153L12.7281 5.89838C13.0644 5.57054 12.8788 4.99936 12.414 4.93182L8.79426 4.40584L7.17547 1.1258L6.81677 1.30283ZM6.7759 10.8948C6.77576 10.8949 6.77562 10.895 6.77548 10.895L6.7759 10.8948ZM6.55907 10.895C6.55896 10.8949 6.55885 10.8949 6.55873 10.8948L6.66732 10.6883L6.55874 10.8948L6.55907 10.895ZM8.84855 4.51585L8.84841 4.51556C8.84846 4.51565 8.84851 4.51575 8.84855 4.51585L8.63931 4.61911L8.84855 4.51585Z"
        fill="white"
        fillOpacity="0.54"
      />
    </svg>
  );
};
