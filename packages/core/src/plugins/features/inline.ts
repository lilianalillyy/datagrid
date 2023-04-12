import { DatagridPlugin } from "../../types";
import { isEnter } from "../../utils";

export function inline(): DatagridPlugin {
  return function () {
    this.el.querySelectorAll<HTMLElement>(".datagrid-inline-edit input").forEach(inputEl => {
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

    this.el.querySelectorAll<HTMLElement>("[data-datagrid-cancel-inline-add]").forEach(cancel => {
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
  };
}
