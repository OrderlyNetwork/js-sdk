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
      className={cn("orderly-grid orderly-gap-2", className)}
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
        "orderly-aspect-square orderly-h-[16px] orderly-w-[16px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast/50 orderly-text-base-contrast/50 orderly-ring-offset-background focus:orderly-outline-none focus-visible:orderly-ring-2 focus-visible:orderly-ring-ring focus-visible:orderly-ring-offset-2 disabled:orderly-cursor-not-allowed disabled:orderly-opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="orderly-flex orderly-items-center orderly-justify-center">
        <Circle className="orderly-h-[8px] orderly-w-[8px] orderly-fill-current orderly-text-current" />
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
    <div className="orderly-flex orderly-gap-1 orderly-items-center">
      <RadioGroupItem {...rest} id={id}></RadioGroupItem>
      <Label htmlFor={id}>{children}</Label>
    </div>
  );
};

export { RadioGroup, RadioGroupItem, Radio };
