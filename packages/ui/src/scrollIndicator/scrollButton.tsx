import { FC } from "react";
import { SVGProps } from "react";
import { cnBase } from "tailwind-variants";

type ScrolButtonProps = {
  tailing?: boolean;
  leading?: boolean;
  visible?: boolean;
  onClick?: (direction: string) => void;
};

export const ScrolButton: FC<ScrolButtonProps> = (props) => {
  const { visible, leading, tailing, onClick } = props;

  if (!visible) {
    return null;
  }

  return (
    <button
      onClick={() => {
        onClick?.(leading ? "left" : "right");
      }}
      className={cnBase(
        leading
          ? "oui-scroll-indicator-leading"
          : "oui-scroll-indicator-tailing",
        "oui-group oui-flex",
        "oui-absolute oui-top-0 oui-bottom-0",
        leading && "oui-left-0 oui-flex-row-reverse",
        tailing && "oui-right-0"
      )}
    >
      <div
        className={cnBase(
          "oui-w-6 oui-h-full",
          "oui-bg-[linear-gradient(90deg,rgba(var(--oui-color-base-9)_/_0)_0%,rgba(var(--oui-color-base-9)_/_1)_100%)]",
          leading && "oui-rotate-180"
        )}
      />
      <div
        className={cnBase(
          "oui-flex oui-justify-center oui-items-center",
          "oui-w-3 oui-bg-base-9 oui-h-full"
        )}
      >
        <ArrowRightIcon
          className={cnBase(
            "oui-text-base-contrast-54 group-hover:oui-text-base-contrast",
            leading && "oui-rotate-180"
          )}
        />
      </div>
    </button>
  );
};

export const ArrowRightIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="6"
    height="14"
    viewBox="0 0 6 14"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1.194.025C.944-.026.675-.005.446.15a1.027 1.027 0 0 0-.28 1.406l3.612 5.437L.166 12.43c-.305.459-.177 1.1.28 1.406a1.02 1.02 0 0 0 1.401-.281l3.986-6a1.03 1.03 0 0 0 0-1.125l-3.986-6C1.695.2 1.444.075 1.194.025" />
  </svg>
);
