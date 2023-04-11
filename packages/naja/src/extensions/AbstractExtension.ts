import { Naja } from "naja";
import {
  AbortEvent,
  BeforeEvent,
  CompleteEvent,
  ErrorEvent,
  InitEvent,
  StartEvent,
  SuccessEvent,
} from "naja/dist/Naja";
import { InteractionEvent, UIHandler } from "naja/dist/core/UIHandler";
import { RedirectEvent, RedirectHandler } from "naja/dist/core/RedirectHandler";
import { Datagrid } from "@liliana/datagrid-core";

export abstract class AbstractExtension<T = any> {
  init?(this: Naja, event: InitEvent): boolean | void;
  before?(this: Naja, event: BeforeEvent): boolean | void;
  start?(this: Naja, event: StartEvent): boolean | void;
  abort?(this: Naja, event: AbortEvent): boolean | void;
  success?(this: Naja, event: SuccessEvent): boolean | void;
  error?(this: Naja, event: ErrorEvent): boolean | void;
  complete?(this: Naja, event: CompleteEvent): boolean | void;
  uiInteraction?(this: UIHandler, event: InteractionEvent): boolean | void;
  redirect?(this: RedirectHandler, event: RedirectEvent): boolean | void;

  protected naja: Naja | null = null;

  constructor(protected grid: Datagrid, protected options: T) {}

  public getNaja(): Naja {
    if (!this.naja) {
      throw new Error("initialize(naja) was not called yet!");
    }

    return this.naja;
  }

  public initialize(naja: Naja) {
    this.init && naja.addEventListener("init", this.init);
    this.before && naja.addEventListener("before", this.before);
    this.start && naja.addEventListener("start", this.start);
    this.abort && naja.addEventListener("abort", this.abort);
    this.success && naja.addEventListener("success", this.success);
    this.error && naja.addEventListener("error", this.error);
    this.complete && naja.addEventListener("complete", this.complete);
    this.uiInteraction && naja.uiHandler.addEventListener("interaction", this.uiInteraction);
    this.redirect && naja.redirectHandler.addEventListener("interaction", this.redirect);
  }

  public getElement(event: CustomEvent<{ element: Element }>) {
    return event.detail.element;
  }
}
