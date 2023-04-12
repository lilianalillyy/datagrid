import { defaultDatagridNameResolver, isEnter, window } from "../utils";
import type {
  DatagridEventMap,
  Nette,
  TypedEventListener,
  Ajax,
  LoadEventData,
  DatagridEventDataMap,
  DatagridOptions,
} from "../types";

export class Datagrid extends EventTarget {
  private static readonly defaultOptions: DatagridOptions = {
    confirm: confirm,
    resolveDatagridName: defaultDatagridNameResolver,
    plugins: [],
    nette: null,
  };

  public readonly name: string;

  public readonly ajax: Ajax;

  public readonly nette: Nette | null;

  private readonly options: DatagridOptions;

  constructor(
    public readonly el: HTMLElement,
    ajax: Ajax | ((grid: Datagrid) => Ajax),
    options: Partial<DatagridOptions>
  ) {
    super();

    const name = this.resolveDatagridName();
    if (!name) {
      throw new Error("Cannot resolve name of a datagrid!");
    }

    this.name = name;

    this.options = {
      ...Datagrid.defaultOptions,
      ...options,
    };

    this.ajax = typeof ajax === "function" ? ajax(this) : ajax;

    this.nette = this.options.nette ?? window().Nette ?? null;
  }

  public load() {
    const shouldLoad = this.dispatchEvent(new CustomEvent<LoadEventData>("beforeLoad"));

    if (!shouldLoad) return;

    /**
     * Cancels iteration if a plugin returns false.
     */
    this.options.plugins.find(
      plugin => (typeof plugin === "function" ? plugin.bind(this)() : plugin.load.bind(this)()) === false
    );

    // Uncheck toggle-all
    const checkedRows = this.el.querySelectorAll<HTMLInputElement>("input[data-check]:checked");
    if (checkedRows.length === 1 && checkedRows[0].getAttribute("name") === "toggle-all") {
      const input = checkedRows[0];
      if (input) {
        input.checked = false;
      }
    }

    this.attachEventListeners();

    this.dispatchEvent(new CustomEvent("afterLoad"));
  }

  private attachEventListeners() {
    this.el.querySelectorAll<HTMLInputElement>("input[data-datagrid-manualsubmit]").forEach(inputEl => {
      const form = inputEl.closest("form");
      if (!form) return;

      inputEl.addEventListener("keydown", e => {
        if (!isEnter(e)) return;

        e.stopPropagation();
        e.preventDefault();
        return this.ajax.submitForm(form);
      });
    });

    // Reload on snippet update
    this.ajax.addEventListener("snippetUpdate", e => {
      const element = e.detail.element;
      if (element.classList.contains(`snippet-grid-${this.name}`)) {
        return this.load();
      }
    });
  }

  public confirm(message: string): boolean {
    return this.options.confirm.bind(this)(message);
  }

  public resolveDatagridName(): string | null {
    return this.options.resolveDatagridName.bind(this)(this.el);
  }

  public declare addEventListener: <K extends keyof DatagridEventMap | string>(
    type: K,
    listener: TypedEventListener<
      Datagrid,
      K extends keyof DatagridEventMap ? DatagridEventMap[K] : CustomEvent
    >,
    options?: boolean | AddEventListenerOptions
  ) => void;

  public declare removeEventListener: <K extends keyof DatagridEventMap | string>(
    type: K,
    listener: TypedEventListener<
      Datagrid,
      K extends keyof DatagridEventMap ? DatagridEventMap[K] : CustomEvent
    >,
    options?: boolean | AddEventListenerOptions
  ) => void;

  public declare dispatchEvent: <K extends keyof DatagridEventMap>(
    event: CustomEvent<DatagridEventDataMap[K]>
  ) => boolean;
}
