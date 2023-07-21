import { ListTile } from "./listTile";
import { ListView } from "./listView";
import { SeparatedListView } from "./separated";

type ListViewType = typeof ListView & {
  separated: typeof SeparatedListView;
  listTile: typeof ListTile;
};

(ListView as ListViewType).separated = SeparatedListView;
(ListView as ListViewType).listTile = ListTile;

export { ListView };
