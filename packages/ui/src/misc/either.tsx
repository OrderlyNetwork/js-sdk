import { FC, memo, PropsWithChildren, ReactNode, useMemo } from "react";

type Props = {
  value: boolean | (() => boolean);
  left?: ReactNode;
};

const Either: FC<PropsWithChildren<Props>> = memo((props) => {
  const { value, children, left } = props;
  const inputValue = useMemo(
    () => Boolean(typeof value === "function" ? value() : value),
    [value]
  );
  if (inputValue) {
    return children;
  }
  return left;
});

export { Either };
