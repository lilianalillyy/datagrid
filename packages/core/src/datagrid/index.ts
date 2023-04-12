import { Datagrid } from "../datagrid/Datagrid";
import { autosubmit, checkboxes, confirm, editable, happy, inline, selectpicker, sortable } from "../plugins";
import { url } from "../plugins/features/url";
import { netteForms } from "../plugins/integrations/nette-forms";
import { Ajax, DatagridsOptions } from "../types";

export class Datagrids {
  private readonly options: DatagridsOptions;

  constructor(private readonly ajax: Ajax, options: Partial<DatagridsOptions> = {}) {
    this.options = {
      selector: "div.datagrid[data-refresh-state]",
      datagrid: {},
      ...options,
    };

    this.loadDatagrids();
  }

  loadDatagrids() {
    [...document.querySelectorAll<HTMLElement>(this.options.selector)].map(
      datagrid => new Datagrid(datagrid, this.ajax, this.options.datagrid)
    );
  }
}

export const createDatagrids = (ajax: Ajax, _options: Partial<DatagridsOptions> = {}) => {
  return new Datagrids(ajax, _options);
};

/**
 * @deprecated Include plugins manually with createDatagrids
 */
export const createFullDatagrids = (ajax: Ajax, _options: Partial<DatagridsOptions> = {}) => {
  return new Datagrids(ajax, {
    datagrid: {
      plugins: [
        autosubmit(),
        checkboxes(),
        confirm(),
        editable(),
        inline(),
        url(),
        happy(),
        netteForms(),
        selectpicker(),
        sortable(),
      ],
    },
    ..._options,
  });
};

export { Datagrid, Datagrid as default } from "./Datagrid";
