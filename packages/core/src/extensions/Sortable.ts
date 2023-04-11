import { Datagrid } from "../Datagrid";
// import Sort from "sortablejs";

export interface SortableInterface {
  initSortable(gridName: string, datagrid: HTMLElement): void;
  initSortableTree(gridName: string, datagrid: HTMLElement): void;
}

// TODO
export class Sortable implements SortableInterface {
  constructor(private datagrid: Datagrid) {}

  initSortable(gridName: string, datagrid: HTMLElement): void {
    const tableBody = datagrid.querySelector("tbody");
    if (!tableBody) return;

    //Sort.create()
  }

  initSortableTree(gridName: string, datagrid: HTMLElement): void {
    // ...
  }
}
