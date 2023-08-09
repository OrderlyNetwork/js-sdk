import { ListTile } from "./listTile";
import { ListView } from "./listView";
import { SeparatedListView } from "./separated";
import { EmptyView } from "./emptyView";

type ListViewType = typeof ListView & {
  separated: typeof SeparatedListView;
  listTile: typeof ListTile;
  emptyView: typeof EmptyView;
};

const Component = ListView as ListViewType;

Component.separated = SeparatedListView;
Component.listTile = ListTile;
Component.emptyView = EmptyView;

export { Component as ListView };
