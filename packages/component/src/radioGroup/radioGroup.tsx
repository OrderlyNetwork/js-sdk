"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/utils/css";
import { Circle } from "lucide-react";
import { Label } from "@/label";
import { useId } from "react";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-[16px] w-[16px] rounded-full border-2 border-base-contrast/50 text-base-contrast/50 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-[8px] w-[8px] fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export type { RadioGroupProps } from "@radix-ui/react-radio-group";

export interface RadioProps {}

const Radio: React.FC<
  React.PropsWithChildren<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
  >
> = (props) => {
  const { children, ...rest } = props;
  const uid = useId();
  const id = props.id || uid;

  return (
    <div className={"flex gap-1 items-center"}>
      <RadioGroupItem {...rest} id={id}></RadioGroupItem>
      <Label htmlFor={id}>{children}</Label>
    </div>
  );
};

export { RadioGroup, RadioGroupItem, Radio };
