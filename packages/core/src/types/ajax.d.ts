export interface RequestArgs<TData = {}> {
  method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
  url: string;
  data: TData;
}

export interface Request {
  params: RequestArgs;
  request: XMLHttpRequest;
}

export type Response<TData = {}> = TData & {
  snippets?: Record<string, string>;
  redirect?: string;
};

export interface Ajax {
  init(): void;
  call<TResponseData = {}, TRequestData = {}>(
    args: RequestArgs<TRequestData>
  ): Promise<Response<TResponseData>>;
  submitForm<TForm extends HTMLFormElement = HTMLFormElement, TData = {}>(
    form: TForm
  ): Promise<Response<TData>>;
}
