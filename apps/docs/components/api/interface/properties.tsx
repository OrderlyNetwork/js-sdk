import { FC } from "react";
import { PropertyItem } from "./propertyItem";

interface Props {
  properties: any[];
}

export const Properties: FC<Props> = (props) => {
  const { properties = [] } = props;
  return (
    <div>
      <div className="text-2xl">Properties</div>
      <div className="space-y-6">
        {properties.map((property) => {
          return (
            <PropertyItem
              key={property.name}
              name={property.name}
              type={property.type}
              optional={property.optional}
              readonly={property.readonly}
            />
          );
        })}
      </div>
    </div>
  );
};
