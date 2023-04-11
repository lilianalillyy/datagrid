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
  element: HTMLElement;
}

export interface LoadEvent extends CustomEvent<LoadEventData> {}

export type DatagridEventMap = {
  /**
   * This event is triggered before each individual datagrid is initialized event listeners are attached
   * to elements on a datagrid. This event is useful if some of the elements
   * are modified and would change how this library interacts with them.
   */
  load: LoadEvent;
};
