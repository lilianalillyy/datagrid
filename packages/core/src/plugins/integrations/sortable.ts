import { Datagrid } from "../../datagrid/Datagrid";
import { DatagridPlugin } from "../../types";
// import Sort from "sortablejs";

export interface SortableInterface {
  initSortable(): void;
  initSortableTree(): void;
}

export interface SortableOptions {
  sortable: SortableInterface | ((datagrid: Datagrid) => SortableInterface);
}

// TODO
export class Sortable implements SortableInterface {
  constructor(private datagrid: Datagrid) {}

  initSortable(): void {
    const tableBody = this.datagrid.el.querySelector("tbody");
    if (!tableBody) return;

    //Sort.create()
  }

  initSortableTree(): void {
    // ...
  }
}

export function sortable(options: Partial<SortableOptions> = {}): DatagridPlugin {
  return function () {
    const isSortable = this.el.hasAttribute("data-sortable");
    const hasSortableTreeChildren = !!this.el.querySelector(".datagrid-tree-item-children");

    const sortable = typeof options.sortable === "function" ? options.sortable(this) : options.sortable;
    if (!sortable) return;

    if (isSortable) {
      sortable.initSortable.bind(this)();
    }

    if (hasSortableTreeChildren) {
      sortable.initSortableTree.bind(this)();
    }
  };
}
