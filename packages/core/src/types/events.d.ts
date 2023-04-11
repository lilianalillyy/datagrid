type TypedEventListenerFunction<ET extends EventTarget, E extends Event> = (
  this: ET,
  event: E
) => boolean | void | Promise<void>;

interface TypedEventListenerObject<E extends Event> {
  handleEvent(event: E): void | Promise<void>;
}

// thank you - https://github.com/naja-js/naja/blob/384d298a9199bf778985d1bcf5747fe8de305b22/src/utils.ts
export type TypedEventListener<ET extends EventTarget, E extends Event> =
  | TypedEventListenerFunction<ET, E>
  | TypedEventListenerObject<E>
  | null;

export interface LoadEventData {
  /**
   * The datagrid container (.datagrid)
   */
  datagrid: HTMLElement;

  /**
   * Name of the datagrid
   */
  gridName: string;
}

export interface LoadEvent extends CustomEvent<LoadEventData> {}

export type DatagridEventMap = {
  /**
   * This event is triggered before an individual datagrid is initialized and event listeners are attached
   * to the elements in the it. This event is useful if you need to change some of the elements, especially
   * if they change how this library interacts with them.
   */
  beforeLoad: LoadEvent;

  /**
   * This event is triggered after an individual datagrid is initialized and event listeners are attached
   * to the elements in the it.
   */
  afterLoad: LoadEvent;
};

export type DatagridEventDataMap = {
  beforeLoad: LoadEventData;
  afterLoad: LoadEventData;
};