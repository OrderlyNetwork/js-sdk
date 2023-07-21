import { Root, Thumb, SwitchProps } from "@radix-ui/react-switch";
import { FC, useId } from "react";

interface MySwitchProps extends SwitchProps {
  label?: string;
}

export const Switch: FC<MySwitchProps> = (props) => {
  const { label, ...switchProps } = props;
  const id = useId();

  return (
    <div className="flex flex-row items-center">
      <Root
        id={id}
        {...switchProps}
        className="w-[28px] h-[14px] bg-slate-400 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default"
      >
        <Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
      </Root>
      {typeof label !== "undefined" && (
        <label htmlFor={id} className="ml-2">
          {label}
        </label>
      )}
    </div>
  );
};
