import type { Naja } from "naja";
import type { Ajax, RequestParams, Response } from "../types";
import { Datagrid } from "../datagrid";

export class NajaAjax extends EventTarget implements Ajax  {
  constructor(public naja: Naja, public datagrid: Datagrid) {
    super();
  }

  init(): void {
    
  }

  async call<TResponseData = {}, TRequestData = {}>(
    args: RequestParams<TRequestData>
  ): Promise<Response<TResponseData>> {
    return (await this.naja.makeRequest(args.method, args.url, args.data)) as Response<TResponseData>;
  }

  async submitForm<TForm extends HTMLFormElement = HTMLFormElement, TResponseData = {}>(
    form: TForm
  ): Promise<Response<TResponseData>> {
    return (await this.naja.uiHandler.submitForm(form)) as Response<TResponseData>;
  }
}
