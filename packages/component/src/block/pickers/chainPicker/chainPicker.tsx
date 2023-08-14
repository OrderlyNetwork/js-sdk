import { Sheet } from "@/sheet";
import { ListView } from "@/listView";
import { FC, useCallback } from "react";
import { Divider } from "@/divider";

export interface ChainPickerProps {
  dataSource: any[];
  value?: any;
  onChange?: (value: any) => void;
}

export const ChainPicker: FC<ChainPickerProps> = (props) => {
  const renderItem = useCallback(() => {
    return <div></div>;
  }, []);

  const renderSeparator = useCallback(() => {
    return <Divider />;
  }, []);

  return (
    <ListView.separated
      dataSource={props.dataSource}
      renderItem={renderItem}
      renderSeparator={renderSeparator}
    />
  );
};
