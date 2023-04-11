import { Datagrid } from "../Datagrid";
import { Happy } from "../Happy";
import { Sortable } from "../extensions";

export interface Nette {
  initForm: (form: HTMLFormElement) => void;
}

export type Constructor<T> = new (...args: any[]) => T;

export interface ExtendedWindow extends Window {
  // Very weak type of jQuery as it is only needed at one place
  // for supporting a basically unused thing and might be removed anyways
  jQuery?: {
    (...args: unknown[]): any;
    fn: {
      selectpicker?: {
        (data: unknown): unknown;
        defaults: Record<string, unknown>;
      };
    };
  };
  Nette?: Nette;
  happy?: Happy;
  Liliana?: {
    Datagrid?: Constructor<Datagrid>;
    Happy?: Constructor<Happy>;
    Sortable?: Constructor<Sortable>;
  };
}

export * from "./events";
export * from "./ajax";
