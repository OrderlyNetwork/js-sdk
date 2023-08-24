import { ListTile } from "./listTile";
import { ListView } from "./listView";
import { SeparatedListView } from "./separated";
import { EmptyView } from "./emptyView";
import { ListTileForSymbol } from "./listTileForSymbol";

type ListViewType = typeof ListView & {
  separated: typeof SeparatedListView;
  listTile: typeof ListTile;
  emptyView: typeof EmptyView;
  symbolTile: typeof ListTileForSymbol;
};

const Component = ListView as ListViewType;

Component.separated = SeparatedListView;
Component.listTile = ListTile;
Component.emptyView = EmptyView;
Component.symbolTile = ListTileForSymbol;

type ListTileComponent = typeof ListTile & {
  symbol: typeof ListTileForSymbol;
};

const ListTileComponent = ListTile as ListTileComponent;
ListTileComponent.symbol = ListTileForSymbol;

export { Component as ListView, ListTileComponent as ListTile };
