import { useState } from "react";
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../tooltip";
import { Input, InputProps } from "./input";

export type InputWithTooltipProps = InputProps & {
  helptext?: string;
};

export const InputWithTooltip = (props: InputWithTooltipProps) => {
  const { helpText, ...inputProps } = props;
  const [open, setOpen] = useState(false);
  return (
    <TooltipRoot open={open}>
      <TooltipTrigger asChild>
        <Input
          {...inputProps}
          // onFocus={() => setOpen(true)}
          // onBlur={() => setOpen(false)}
        />
      </TooltipTrigger>
      <TooltipProvider>
        <TooltipContent>{props.helptext}</TooltipContent>
      </TooltipProvider>
    </TooltipRoot>
  );
};
