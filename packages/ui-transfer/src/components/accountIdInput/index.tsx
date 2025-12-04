import { useEffect, useRef } from "react";
import { Box, cn, Flex, Text } from "@veltodefi/ui";
import { InputStatus } from "../../types";

export type TextAreaInputProps = {
  value: string;
  onChange: (value: string) => void;
  status?: InputStatus;
  hintMessage?: string;
  placeholder?: string;
  className?: string;
  label: string;
  disabled?: boolean;
};

export const TextAreaInput = (props: TextAreaInputProps) => {
  const { value, onChange, status, hintMessage, placeholder, label } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);

    // auto adjust height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const prefix = (
    <div className="oui-absolute oui-left-3 oui-top-0.5 oui-z-[1]">
      <Text size="2xs" intensity={36}>
        {label}
      </Text>
    </div>
  );

  const message = (
    <Flex mt={1} gapX={1} px={1}>
      <Box
        width={4}
        height={4}
        r="full"
        className={cn(
          status === "error" && "oui-bg-danger-light",
          status === "warning" && "oui-bg-warning-light",
        )}
      ></Box>
      <Text
        size="2xs"
        className={cn(
          status === "error" && "oui-text-danger-light",
          status === "warning" && "oui-text-warning-light",
        )}
      >
        {hintMessage}
      </Text>
    </Flex>
  );
  return (
    <div className="oui-relative">
      {prefix}
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        className={cn(
          // hide resize height control and scrollbar
          "oui-resize-none oui-overflow-y-hidden",
          "oui-relative oui-min-h-[54px] oui-px-3 oui-pb-2 oui-pt-5",
          "oui-w-full oui-bg-base-5 oui-text-sm oui-text-base-contrast",
          "oui-rounded-lg oui-outline-none",
          "oui-border oui-border-line focus:oui-border-primary-light",
          status === "error" &&
            "oui-border-danger-light focus-within:oui-border-danger-light focus:oui-border-danger-light",
          status === "warning" &&
            "oui-border-warning-light focus-within:oui-border-warning-light focus:oui-border-warning-light",
          "disabled:oui-cursor-not-allowed",
          props.className,
        )}
        rows={1}
        value={value}
        onChange={handleChange}
        disabled={props.disabled}
      />
      {hintMessage && message}
    </div>
  );
};
