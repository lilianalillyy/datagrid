import { Datagrid } from "../datagrid/Datagrid";
import { Happy } from "../Happy";
import { Sortable } from "../plugins";

export interface DatagridOptions {
  confirm(this: Datagrid, message: string): boolean;
  // Returning null will skip this datagrid
  resolveDatagridName: (this: Datagrid, datagrid: HTMLElement) => string | null;
  plugins: DatagridPlugin<any>[];
  nette: Nette | null;
}

export interface DatagridsOptions {
  datagrid: Partial<DatagridOptions>;
  selector: string;
}

export interface Nette {
  initForm: (form: HTMLFormElement) => void;
}

export type Constructor<T> = new (...args: any[]) => T;

export interface ExtendedWindow extends Window {
  jQuery?: any;
  Nette?: Nette;
  happy?: Happy;
  Liliana?: {
    Datagrid?: Constructor<Datagrid>;
    createDatagrid: typeof A;
  };
}

export type DatagridPluginCallback<T extends unknown | boolean> = (this: Datagrid) => T;

export interface DatagridPluginObject<T extends unknown | boolean> {
  name?: string;
  load: DatagridPluginCallback<T>;
}

export type DatagridPlugin<T extends unknown | boolean = unknown> =
  | DatagridPluginCallback<T>
  | DatagridPluginObject<T>;

export * from "./events";
export * from "./ajax";
