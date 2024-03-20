export interface Color {
  value: string;
  name: string;
  id: string;
}

export interface ColorGroup {
  groupName: string;
  colors: Color[];
}

export type NamedColor = {
  name: string;
  color: string;
  reference?: string;
};

export type NamedColorGroup = {
  groupName: string;
  colors: NamedColor[];
};
