import { Datagrid } from "../datagrid/Datagrid";
import { TypedEventListener } from "./events";

export interface RequestParams<TData = {}> {
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
  url: string;
  data: TData;
}

export interface Request<TData = {}> {
  params: RequestParams<TData>;
}

export interface SuccessPayload {
  _datagrid_url?: boolean;
  _datagrid_sort?: string[];
  _datagrid_editable_new_value?: string;
  state: {};
}

export type Response<TData = SuccessPayload> = TData & {
  snippets?: Record<string, string>;
  redirect?: string;
};

export interface BeforeEventData<T = {}> {
  params: RequestParams<T>;
}

export interface InteractEventData<T extends HTMLElement = HTMLElement> {
  element: T;
}

export interface SuccessEventData<T = SuccessPayload> {
  params: RequestParams;
  payload: Response<T>;
}

export interface ErrorEventData<T = unknown> {
  params: RequestParams;
  error?: T;
}

export interface BeforeEvent extends CustomEvent<BeforeEventData> {
}

export interface InteractEvent extends CustomEvent<InteractEventData> {
}

export interface SnippetUpdateEvent extends InteractEvent {
}

export interface SuccessEvent extends CustomEvent<SuccessEventData> {
}

export interface ErrorEvent extends CustomEvent<ErrorEventData> {
}

export interface AjaxEventMap {
  before: BeforeEvent;
  interact: InteractEvent;
  snippetUpdate: SnippetUpdateEvent;
  success: SuccessEvent;
  error: ErrorEvent;
}

export interface Ajax extends EventTarget {
  init(): void;

  call<TResponseData = {}, TRequestData = {}>(
    args: RequestParams<TRequestData>
  ): Promise<Response<TResponseData>>;

  submitForm<TForm extends HTMLFormElement = HTMLFormElement, TData = {}>(
    form: TForm
  ): Promise<Response<TData>>;

  addEventListener<K extends keyof AjaxEventMap | string>(
    type: K,
    listener: TypedEventListener<Ajax, K extends keyof AjaxEventMap ? AjaxEventMap[K] : CustomEvent>,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener<K extends keyof AjaxEventMap | string>(
    type: K,
    listener: TypedEventListener<Ajax, K extends keyof AjaxEventMap ? AjaxEventMap[K] : CustomEvent>,
    options?: boolean | AddEventListenerOptions
  ): void;
}
