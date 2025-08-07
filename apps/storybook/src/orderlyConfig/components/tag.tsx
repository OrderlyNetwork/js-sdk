import { Text } from "@orderly.network/ui";

export const Tag = (props: { text: string }) => {
  return (
    <div
      className={
        "oui-ml-1 oui-inline-flex oui-rounded oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)] oui-px-2 oui-py-1"
      }
    >
      <Text.gradient
        color={"brand"}
        size={"3xs"}
        className="oui-whitespace-nowrap oui-break-normal"
      >
        {props.text}
      </Text.gradient>
    </div>
  );
};
