import { ExtendedWindow } from "./types";

export function isPromise<T = any>(p: any): p is Promise<T> {
  return typeof p === "object" && typeof p.then === "function";
}

export function isInKeyRange(e: KeyboardEvent, min: number, max: number): boolean {
  const code = e.key.length === 1 ? e.key.charCodeAt(0) : 0;
  return code >= min && code <= max;
}

export function isEnter(e: KeyboardEvent): boolean {
  return e.key === "Enter";
}

export function isEsc(e: KeyboardEvent): boolean {
  return e.key === "Escape";
}

export function isFunctionKey(e: KeyboardEvent): boolean {
  return e.key.length === 2 && e.key.startsWith("F");
}

export function window(): ExtendedWindow {
  return (window ?? {}) as unknown as ExtendedWindow;
}

export function calculateCellLines(el: HTMLElement) {
  const cellPadding = el.style.padding ? parseInt(el.style.padding.replace(/[^-\d\.]/g, ""), 10) : 0;
  const cellHeight = el.getBoundingClientRect().height;
  const lineHeight = Math.round(parseFloat(el.style.lineHeight ?? "0"));
  const cellLines = Math.round((cellHeight - 2 * cellPadding) / lineHeight);

  return cellLines;
}

// A little better debounce ;)
export function debounce<TArgs, TFun extends (...args: TArgs[]) => unknown | Promise<unknown>>(
  fn: TFun,
  slowdown: number = 200
): (...args: TArgs[]) => void {
  let timeout: NodeJS.Timeout | number | null = null;
  let blockedByPromise: boolean = false;

  return (...args) => {
    if (blockedByPromise) return;

    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      const result = fn(...args);

      if (isPromise(result)) {
        blockedByPromise = true;
        result.finally(() => {
          blockedByPromise = false;
        });
      }
    }, slowdown);
  };
}
