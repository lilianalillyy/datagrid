import { DatagridPlugin } from "../../types";
import { window } from "../../utils";

/**
 * @deprecated
 */
export function selectpicker(): DatagridPlugin {
  return function () {
    const pickers = this.el.querySelectorAll<HTMLElement>(".selectpicker");
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
  };
}
