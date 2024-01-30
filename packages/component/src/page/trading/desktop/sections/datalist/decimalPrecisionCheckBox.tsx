import React from "react";
import { FC, useEffect, useState } from "react";
import { Circle } from "lucide-react";

export enum DecimalPrecisionType {
    ZERO,ONE,TWO
  }
  
  interface Props {
    value: DecimalPrecisionType;
    onValueChange: (value: any) => void;
  }
  
  export const DecimalPrecisionCheckbox: FC<Props> = ({ value, onValueChange }) => {
    return (
      <div className="orderly-flex orderly-items-center orderly-space-x-3">
        <DecimalPrecisionItem
          active={value === DecimalPrecisionType.ZERO}
          label="1"
          value={DecimalPrecisionType.ZERO}
          onClick={onValueChange}
        />
        <DecimalPrecisionItem
          active={value === DecimalPrecisionType.ONE}
          label="0.1"
          value={DecimalPrecisionType.ONE}
          onClick={onValueChange}
        />
        <DecimalPrecisionItem
          active={value === DecimalPrecisionType.TWO}
          label="0.01"
          value={DecimalPrecisionType.TWO}
          onClick={onValueChange}
        />
      </div>
    );
  };
  
  
  const DecimalPrecisionItem: FC<{
    active: boolean;
    label: string;
    value: DecimalPrecisionType;
    onClick: (value: DecimalPrecisionType | "") => void;
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