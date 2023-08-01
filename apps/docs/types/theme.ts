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
  // 引用的颜色ID, 用于关联到Color，如果为null则表示是一个自定义的颜色
  reference?: string;
};

export type NamedColorGroup = {
  groupName: string;
  colors: NamedColor[];
};
