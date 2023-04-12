import { DatagridPlugin } from "../../types";
import { debounce, isEnter, isFunctionKey, isInKeyRange } from "../../utils";

export const AutosubmitAttribute = "data-autosubmit";

export const AutosubmitPerPageAttribute = "data-autosubmit-per-page";

export const AutosubmitChangeAttribute = "data-autosubmit-change";

export function autosubmit(): DatagridPlugin {
  return function () {
    // Auto-submit perPage
    this.el
      .querySelectorAll<HTMLSelectElement>(`select[${AutosubmitPerPageAttribute}]`)
      .forEach(pageSelectEl => {
        pageSelectEl.addEventListener("change", () => {
          let inputEl = pageSelectEl.parentElement?.querySelector("input[type=submit]");
          if (!inputEl) {
            inputEl = pageSelectEl.parentElement?.querySelector("button[type=submit]");
          }

          if (!(inputEl instanceof HTMLElement)) return;

          inputEl.click();
        });
      });

    this.el
      .querySelectorAll<HTMLSelectElement | HTMLInputElement>(`[${AutosubmitAttribute}]`)
      .forEach(submitEl => {
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
          if (submitEl.hasAttribute(AutosubmitChangeAttribute)) {
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
  };
}
