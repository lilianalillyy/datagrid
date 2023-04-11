import type { Naja } from "naja";
import type { Datagrid, Ajax, RequestArgs, Response } from "@liliana/datagrid-core";

export class NajaAjax implements Ajax {
  constructor(public naja: Naja, public datagrid: Datagrid) {}

  init(): void {
    this.naja.addEventListener("success", () => {
      this.datagrid.loadDatagrids();
    });
  }

  async call<TResponseData = {}, TRequestData = {}>(
    args: RequestArgs<TRequestData>
  ): Promise<Response<TResponseData>> {
    return (await this.naja.makeRequest(args.method, args.url, args.data)) as Response<TResponseData>;
  }

  async submitForm<TForm extends HTMLFormElement = HTMLFormElement, TResponseData = {}>(
    form: TForm
  ): Promise<Response<TResponseData>> {
    return (await this.naja.uiHandler.submitForm(form)) as Response<TResponseData>;
  }
}
