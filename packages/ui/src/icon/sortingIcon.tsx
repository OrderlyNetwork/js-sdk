import React from "react";
import { BaseIcon, BaseIconProps } from "./baseIcon";

export const SortingIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  (props, ref) => {
    const { opacity = 0.54, ...rest } = props;
    return (
      <BaseIcon ref={ref} {...rest}>
        <path
          fill="currentcolor"
          fillOpacity={opacity}
          d="M12 2.5c-.3 0-.611.112-.81.325l-5.99 6.4c-.495.527-.013 1.275.81 1.275h11.98c.823 0 1.305-.748.81-1.275l-5.99-6.4c-.198-.213-.51-.325-.81-.325m0 19c-.3 0-.611-.112-.81-.325l-5.99-6.4c-.495-.527-.013-1.275.81-1.275h11.98c.823 0 1.305.748.81 1.275l-5.99 6.4c-.198.213-.51.325-.81.325"
        />
      </BaseIcon>
    );
  }
);

SortingIcon.displayName = "SortingIconIcon";
