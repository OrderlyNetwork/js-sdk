import React from "react";
import { FC, useEffect, useState } from "react";
import { Circle } from "lucide-react";

export enum UnPnlPriceBasisType {
    MARKET_PRICE,LAST_PRICE
  }
  
  interface Props {
    value: UnPnlPriceBasisType;
    onValueChange: (value: any) => void;
  }
  
  export const UnPnlPriceBasisCheckBox: FC<Props> = ({ value, onValueChange }) => {
    return (
      <div className="orderly-flex orderly-items-center orderly-space-x-3">
        <UnPnlPriceBasisItem
          active={value === UnPnlPriceBasisType.MARKET_PRICE}
          label="Mark Price"
          value={UnPnlPriceBasisType.MARKET_PRICE}
          onClick={onValueChange}
        />
        <UnPnlPriceBasisItem
          active={value === UnPnlPriceBasisType.LAST_PRICE}
          label="Last Price"
          value={UnPnlPriceBasisType.LAST_PRICE}
          onClick={onValueChange}
        />
      </div>
    );
  };
  
  
  const UnPnlPriceBasisItem: FC<{
    active: boolean;
    label: string;
    value: UnPnlPriceBasisType;
    onClick: (value: UnPnlPriceBasisType | "") => void;
  }> = (props) => {
    let clsName = "orderly-flex orderly-items-center orderly-gap-1 orderly-cursor-pointer";
    if (props.active) {
      clsName += " orderly-text-base-contrast";
    } else {
      clsName += " orderly-text-base-contrast-54";
    }
    return (
      <div
        className={clsName}
        onClick={() => {
          props.onClick(props.active ? "" : props.value);
        }}
      >
        <button
          type="button"
          className="orderly-w-[14px] orderly-h-[14px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast-20"
        >
          {props.active && (
            // @ts-ignore
            <Circle className="orderly-w-[10px] orderly-h-[10px] orderly-text-base-contrast orderly-bg-base-contrast orderly-rounded-full" />
          )}
        </button>
        <span className="orderly-text-3xs">{props.label}</span>
      </div>
    );
  };