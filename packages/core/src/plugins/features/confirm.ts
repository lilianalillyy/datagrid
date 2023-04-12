import { Datagrid } from "../../datagrid/Datagrid";
import { DatagridPlugin } from "../../types";

export const ConfirmAttribute = "data-datagrid-confirm";

function confirmEventHandler(this: Datagrid, el: HTMLElement, e: Event) {
  const message = el.getAttribute(ConfirmAttribute)!;
  if (!message) return;

  if (!this.confirm(message)) {
    e.stopPropagation();
    e.preventDefault();
  }
}

export function confirm(): DatagridPlugin {
  return function () {
    this.el
      .querySelectorAll<HTMLElement>(`[${ConfirmAttribute}]:not(.ajax)`)
      .forEach(confirmEl =>
        confirmEl.addEventListener("click", e => confirmEventHandler.bind(this)(e.target as HTMLElement, e))
      );

    this.ajax.addEventListener("interact", e => confirmEventHandler.bind(this)(e.detail.element, e));
  };
}
