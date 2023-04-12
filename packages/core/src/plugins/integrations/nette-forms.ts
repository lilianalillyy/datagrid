import { DatagridPlugin } from "../../types";

export function netteForms(): DatagridPlugin {
  return function () {
    if (this.nette) {
      this.el.querySelectorAll<HTMLFormElement>("form").forEach(form => this.nette!.initForm(form));
    }
  };
}
