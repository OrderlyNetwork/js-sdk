import React from "react";
import { BaseIcon, BaseIconProps } from "./baseIcon";
import { BaseIconWithPath } from "./baseIconWithPath";

export const ArrowDownShortIcon = React.forwardRef<
  SVGSVGElement,
  BaseIconProps
>((props, ref) => {
  return (
    <BaseIconWithPath
      ref={ref}
      {...props}
      d="M11.327 5.34408C10.8369 5.34408 10.4396 5.74125 10.4396 6.23142C10.4396 6.65696 10.4396 11.6248 10.4396 13.0135L7.77493 10.3112L6.52604 11.5602L10.6887 15.7502C10.8621 15.9235 11.0959 16.0108 11.3292 16.0108C11.5626 16.0108 11.7964 15.9225 11.9698 15.7492L16.1328 11.5592L14.8839 10.3102L12.219 13.0125C12.219 11.6238 12.219 6.65696 12.219 6.23142C12.219 5.74125 11.8218 5.34408 11.3317 5.34408H11.327Z"
    ></BaseIconWithPath>
  );
});

ArrowDownShortIcon.displayName = "ArrowDownShortIcon";