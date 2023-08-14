import { FC } from "react";
import { RadioGroup, Radio, type RadioGroupProps } from "./radioGroup";

export interface SimpleRadioGroupProps extends RadioGroupProps {
  // name: string;
}

export const SimpleRadioGroup: FC<SimpleRadioGroupProps> = (props) => {
  return (
    <RadioGroup {...props}>
      <Radio value="1">Direct messages and mentions</Radio>
    </RadioGroup>
  );
};
