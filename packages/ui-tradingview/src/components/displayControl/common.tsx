import { DisplayControlSettingInterface } from "../../type";

export interface IProps {
  displayControlState: DisplayControlSettingInterface;
  changeDisplayControlState: (state: DisplayControlSettingInterface) => void;
}
export type DisplayControl = {
  label: string;
  id: keyof DisplayControlSettingInterface;
};
