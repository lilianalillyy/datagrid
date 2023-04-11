import { calculateCellLines, debounce, isEnter, isEsc, isFunctionKey, isInKeyRange, window } from "./utils";
import type {
  DatagridEventMap,
  Nette,
  TypedEventListener,
  Ajax,
  LoadEventData,
  DatagridEventDataMap,
} from "./types";
import type { SortableInterface } from "./extensions/Sortable";
import type { Happy } from "./Happy";

export interface DatagridOptions {
  confirm(this: Datagrid, message: string): boolean;
  rootEl: HTMLElement;
  datagridSelector: string;
  // Returning null will skip this datagrid
  resolveDatagridName: (this: Datagrid, datagrid: HTMLElement) => string | null;
  sortable: ((datagrid: Datagrid) => SortableInterface) | SortableInterface | null;
  happy: Happy | null;
  nette: Nette | null;
}

export class Datagrid extends EventTarget {
  private static readonly defaultOptions: DatagridOptions = {
    rootEl: document.body,
    confirm: confirm,
    datagridSelector: "div.datagrid[data-refresh-state]",
    resolveDatagridName: datagrid => {
      // This attribute is not present by default, though if you're going to use this library
      // it's recommended to add it, because when not present, the fallback way is to parse the datagrid-<name> class,
      // which is definitely far from reliable. Alternatively (mainly in case of a custom datagrid class),
      // you can pass your own resolveDatagridName function to the option.
      const attrName = datagrid.getAttribute("data-datagrid-name");
      if (attrName) return attrName;

      console.warn(
        "Deprecated name resolution for datagrid",
        datagrid,
        ": Please add a data-datagrid-name attribute instead!\n" +
          "Currently, the Datagrid library relies on matching the name from the 'datagrid-[name]' class, which is unreliable " +
          "and may cause bugs if the default class names are not used (eg. if you add a datagrid-xx class, or change the name class completely!)\n" +
          "Alternatively, you can customize the name resolution with the `resolveDatagridName` option. See TBD for more info." // TODO
      );

      const classes = datagrid.classList.value.split(" ");

      // Returns the first datagrid-XXX match
      for (const className of classes) {
        if (!className.startsWith("datagrid-")) continue;

        const [, ...split] = className.split("-");
        const name = split.join("-");

        // In case nothing actually follows the prefix (className = "datagrid-")
        if (name.length < 1) {
          console.error(`Failed to resolve datagrid name - ambigious class name '${className}'`);
          return null;
        }

        return name;
      }

      return null;
    },
    sortable: null,
    happy: null,
    nette: null,
  };

  private readonly rootEl: HTMLElement;

  public readonly ajax: Ajax;

  private readonly options: DatagridOptions;

  private readonly sortable: SortableInterface | null = null;

  private readonly happy: Happy | null = null;

  private readonly nette: Nette | null = null;

  constructor(ajax: Ajax | ((grid: Datagrid) => Ajax), options: Partial<DatagridOptions>) {
    super();

    this.options = {
      ...Datagrid.defaultOptions,
      ...options,
    };

    this.rootEl = this.options.rootEl;
    this.ajax = typeof ajax === "function" ? ajax(this) : ajax;
    this.sortable =
      typeof options.sortable === "function" ? options.sortable(this) : options.sortable ?? null;
    this.happy = options.happy ?? window().happy ?? null;
    this.nette = options.nette ?? window().Nette ?? null;

    this.ajax.init();
    this.loadDatagrids();
  }

  public loadDatagrids() {
    this.rootEl.querySelectorAll<HTMLElement>(this.options.datagridSelector).forEach(datagrid => {
      const gridName = this.resolveDatagridName(datagrid);
      if (!gridName) {
        return;
      }

      const shouldLoad = this.dispatchEvent(
        new CustomEvent<LoadEventData>("beforeLoad", { detail: { datagrid, gridName } })
      );

      if (!shouldLoad) return;

      const isSortable = datagrid.hasAttribute("data-sortable");
      const hasSortableTreeChildren = !!datagrid.querySelector(".datagrid-tree-item-children");

      // Fort Sortable behavior, check if Sortable was passed first
      if ((isSortable || hasSortableTreeChildren) && !this.sortable) {
        console.warn(
          "Sortable behavior is enabled for datagrid",
          datagrid,
          "- however the Sortable was not passed to Datagrid!\n",
          "Fix: `new Datagrid(ajax, { sortable: (grid) => new Sortable(grid) })`\n" +
            "(don't forget to `import { Sortable } from '@liliana/datagrid-core'`)"
        );
      } else {
        if (isSortable) {
          this.sortable!.initSortable(gridName, datagrid);
        }

        if (hasSortableTreeChildren) {
          this.sortable!.initSortableTree(gridName, datagrid);
        }
      }

      const pickers = datagrid.querySelectorAll<HTMLElement>(".selectpicker");
      // Selectpicker support (drop in future??)
      // Not checking for '$' as it doesn't have to be jQuery
      if (pickers.length >= 1 && window().jQuery) {
        const $ = window().jQuery;
        if ($?.fn.selectpicker) {
          $.fn.selectpicker.defaults = {
            countSelectedText: pickers.item(0).getAttribute("i18n-selected") ?? "",
            iconBase: "fa",
            tickIcon: pickers.item(0).getAttribute("selected-icon-check") ?? "fa fa-check",
          };

          pickers.forEach(picker =>
            $(picker)
              .removeClass("form-select form-select-sm")
              .addClass("form-control form-control-sm")
              .selectpicker("destroy")
              .selectpicker({})
          );

          [...pickers]
            .filter(picker => picker.hasAttribute("data-datagrid-multiselect-id"))
            .forEach(picker => {
              const $picker = $(picker);
              const $parent = $picker.parent();

              $picker.removeAttr("id");
              const id = picker.getAttribute("data-datagrid-multiselect-id");

              $picker.on("loadded.bs.select", () => {
                $parent.attr("style", "display: none;");
                $parent.find(".hidden").removeClass("hidden").addClass("btn-default btn-secondary");
              });

              $picker.on("rendered.bs.select", () => $parent.attr("id", id));
            });
        }
      }

      if (this.happy) {
        this.happy.init();
      }

      // Uncheck toggle-all
      const checkedRows = datagrid.querySelectorAll<HTMLInputElement>("input[data-check]:checked");
      if (checkedRows.length === 1 && checkedRows[0].getAttribute("name") === "toggle-all") {
        const input = checkedRows[0];
        if (input) {
          input.checked = false;
        }
      }

      // Nette forms
      if (this.nette) {
        datagrid.querySelectorAll<HTMLFormElement>("form").forEach(form => this.nette!.initForm(form));
      }

      this.attachEventListeners(gridName, datagrid);

      this.dispatchEvent(new CustomEvent("afterLoad", { detail: { datagrid, gridName } }));
    });
  }

  private attachEventListeners(gridName: string, datagrid: HTMLElement) {
    // Confirm dialog (.ajax is handled by Ajax implementations)
    datagrid.querySelectorAll<HTMLElement>("[data-datagrid-confirm]:not(.ajax").forEach(confirmEl => {
      confirmEl.addEventListener("click", e => {
        const message = confirmEl.getAttribute("data-datagrid-confirm")!;
        if (!message) return;

        if (!this.confirm(message)) {
          e.stopPropagation();
          e.preventDefault();
        }
      });
    });

    // Auto-submit perPage
    datagrid.querySelectorAll<HTMLSelectElement>("select[data-autosubmit-per-page]").forEach(pageSelectEl => {
      pageSelectEl.addEventListener("change", () => {
        let inputEl = pageSelectEl.parentElement?.querySelector("input[type=submit]");
        if (!inputEl) {
          inputEl = pageSelectEl.parentElement?.querySelector("button[type=submit]");
        }

        if (!(inputEl instanceof HTMLElement)) return;

        inputEl.click();
      });
    });

    datagrid.querySelectorAll<HTMLSelectElement | HTMLInputElement>("[data-autosubmit]").forEach(submitEl => {
      const form = submitEl.closest("form");
      if (!form) return;

      // Select auto-submit
      if (submitEl instanceof HTMLSelectElement) {
        submitEl.addEventListener("change", () => this.ajax.submitForm(form));

        return;
      }

      // Input auto-submit
      if (submitEl instanceof HTMLInputElement) {
        // Handle change events
        if (submitEl.hasAttribute("data-autosubmit-change")) {
          submitEl.addEventListener(
            "change",
            debounce(() => this.ajax.submitForm(form))
          );
        }

        submitEl.addEventListener(
          "keyup",
          debounce(e => {
            // Ignore keys such as alt, ctrl, etc, F-keys... (when enter is not pressed)
            if (!isEnter(e) && (isInKeyRange(e, 9, 40) || isFunctionKey(e))) {
              return;
            }

            return this.ajax.submitForm(form);
          })
        );
      }
    });

    // Submitting inline edit
    datagrid.querySelectorAll<HTMLElement>(".datagrid-inline-edit input").forEach(inputEl => {
      inputEl.addEventListener("keydown", e => {
        if (!isEnter(e)) return;

        e.stopPropagation();
        e.preventDefault();

        return inputEl
          .closest("tr")
          ?.querySelector<HTMLElement>(".col-action-inline-edit [name='inline_edit[submit]']")
          ?.click();
      });
    });

    // Submit manual submit inputs by pressing Enter
    datagrid.querySelectorAll<HTMLInputElement>("input[data-datagrid-manualsubmit]").forEach(inputEl => {
      const form = inputEl.closest("form");

      inputEl.addEventListener("keydown", e => {
        if (!isEnter(e)) return;

        e.stopPropagation();
      });
    });

    let lastCheckbox = null;

    datagrid.addEventListener("click", e => {
      if (!(e.target instanceof HTMLElement)) return;

      if (e.target.classList.contains("col-checkbox")) {
        lastCheckbox = e.target;
        if (e.shiftKey && lastCheckbox) {
          const currentCheckboxRow = lastCheckbox.closest("tr");
          if (!currentCheckboxRow) return;

          const lastCheckboxRow = lastCheckbox.closest("tr");
          if (!lastCheckboxRow) return;

          const lastCheckboxTbody = lastCheckboxRow.closest("tbody");
          if (!lastCheckboxTbody) return;

          const checkboxesRows = [...lastCheckboxTbody.querySelectorAll<HTMLElement>("tr")];
          const [start, end] = [lastCheckboxRow.rowIndex, currentCheckboxRow.rowIndex].sort();
          const rows = checkboxesRows.slice(start, end + 1);

          rows.forEach(row => {
            const input = row.querySelector<HTMLInputElement>('.col-checkbox input[type="checkbox"]');
            if (input) {
              input.checked = true;
            }
          });
        }
      }
    });

    const checkboxes = datagrid.querySelectorAll<HTMLInputElement>(`input[data-check-all-${gridName}]'`);
    const select = datagrid.querySelector<HTMLSelectElement>("select[name='group_action[group_action]']");
    const actionButtons = document.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
      ".row-group-actions *[type='submit']"
    );
    const counter = document.querySelector<HTMLElement>(".datagrid-selected-rows-count");

    // Handling a checkbox click + select all checkbox
    datagrid.querySelectorAll<HTMLElement>("[data-check]").forEach(checkEl => {
      checkEl.addEventListener("change", () => {
        const checked = [...checkboxes].filter(checkbox => checkbox.checked);
        const hasChecked = checked.length >= 1;

        actionButtons.forEach(button => (button.disabled = !hasChecked));

        if (select) {
          select.disabled = !hasChecked;
        }

        if (counter) {
          counter.innerText = `${checked.length}/${checkboxes.length}`;
        }

        // Select all
        const isSelectAll = checkEl.hasAttribute("data-check-all");
        if (isSelectAll) {
          checkboxes.forEach(checkbox => (checkbox.checked = true));
        }
      });
    });

    // Editing
    datagrid.querySelectorAll<HTMLElement>("[data-datagrid-editable-url]").forEach(cell => {
      if (cell instanceof HTMLAnchorElement || cell.classList.contains("datagrid-inline-edit")) return;

      if (!cell.classList.contains("editing")) {
        cell.classList.add("editing");
        const originalValue = cell.innerHTML.replace(/<\/?br>/g, "\n");
        const valueToEdit = cell.getAttribute("data-datagrid-editable-value") ?? originalValue;

        cell.setAttribute("originalValue", originalValue);
        cell.setAttribute("valueToEdit", valueToEdit);

        const type = cell.getAttribute("datagrid-editable-type") ?? "text";

        let input: HTMLElement;

        switch (type) {
          case "textarea":
            cell.innerHTML = `<textarea rows="${calculateCellLines(cell)}">${valueToEdit}</textarea>`;
            input = cell.querySelector("textarea")!;
            break;
          case "select":
            input = cell.querySelector(cell.getAttribute("datagrid-editable-element") ?? "")!;
            input
              .querySelectorAll(`option[value='${valueToEdit}']`)
              .forEach(input => input.setAttribute("selected", "true"));
            break;
          default:
            cell.innerHTML = `<input type='${type}' />`;
            input = cell.querySelector("input")!;
        }

        const attributes = JSON.parse(cell.getAttribute("datagrid-editable-attrs") ?? "{}");
        for (const key in attributes) {
          const value = attributes[key];
          input.setAttribute(key, value);
        }

        cell.classList.remove("edited");

        const submitCell = async (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
          let value = el.value;
          if (value !== valueToEdit) {
            try {
              const response = await this.ajax.call<{ _datagrid_editable_new_value?: string }>({
                url: cell.getAttribute("datagrid-editable-url") ?? "",
                method: "POST",
                data: {
                  value,
                },
              });

              if (type === "select") {
                cell.innerHTML = cell.querySelector(`option[value='${value}']`)?.innerHTML ?? "";
              } else {
                if (response._datagrid_editable_new_value) {
                  value = response._datagrid_editable_new_value;
                }
                cell.innerHTML = value;
              }
              cell.classList.add("edited");
            } catch {
              cell.innerHTML = originalValue;
              cell.classList.add("edited-error");
            }
          } else {
            cell.innerHTML = originalValue;
          }

          cell.classList.remove("editing");
        };

        cell
          .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            "input, textarea, select"
          )
          .forEach(el => {
            el.addEventListener("blur", () => submitCell(el));
            el.addEventListener("keydown", e => {
              if (isEnter(e as KeyboardEvent)) {
                e.stopPropagation();
                e.preventDefault();
                return submitCell(el);
              }

              if (isEsc(e as KeyboardEvent)) {
                e.stopPropagation();
                e.preventDefault();
                cell.classList.remove("editing");
                cell.innerHTML = originalValue;
              }
            });

            if (el instanceof HTMLSelectElement) {
              el.addEventListener("change", () => submitCell(el));
            }
          });
      }
    });

    datagrid.querySelectorAll<HTMLElement>("[data-datagrid-cancel-inline-add]").forEach(cancel => {
      cancel.addEventListener("mouseup", e => {
        if (e.button === 0) {
          e.stopPropagation();
          e.preventDefault();
          const inlineAdd = cancel.closest<HTMLElement>(".datagrid-row-inline-add");
          if (inlineAdd) {
            inlineAdd.classList.add("datagrid-row-inline-add-hidden");
          }
        }
      });
    });
  }

  /**
   * @internal
   */
  public serializeUrl(params: Record<string, any | any[]>, prefix: string = ""): string {
    const encodedParams = [];

    for (const _key in params) {
      const value = params[_key];
      // Cannot do !value as that would also exclude valid negative values such as 0 or false
      if (value === null || value === undefined) continue;

      const key = prefix ? `${prefix}[${_key}]` : _key;

      // Skip empty strings
      if (typeof value === "string" && value.trim().length < 1) continue;

      if (typeof value === "object") {
        const nestedParams = this.serializeUrl(value, key);
        // Don't include if object is empty
        if (nestedParams.length >= 1) {
          encodedParams.push(nestedParams);
        }

        continue;
      }

      encodedParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }

    return encodedParams.join("&");
  }

  public confirm(message: string): boolean {
    return this.options.confirm.bind(this)(message);
  }

  public resolveDatagridName(datagrid: HTMLElement): string | null {
    return this.options.resolveDatagridName.bind(this)(datagrid);
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
