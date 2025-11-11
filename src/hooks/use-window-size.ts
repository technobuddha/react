import React from 'react';
import { type ElementSize, measureWindow } from '@technobuddha/library';
import { throttle } from '@technobuddha/library';

/**
 * Gets the current window size, including the dimensions of the scroll bars.
 *
 * Also returns a `count` property, which increments each time the window is resized (since mount).
 *
 * @returns width, height, scrollbarWidth, scrollbarHeight, count
 * @group React
 * @category Hooks
 */
export function useWindowSize(): ElementSize & { count: number } {
  const isClient = globalThis.window !== undefined;
  const [count, setCount] = React.useState(0);
  const [size, setSize] = React.useState(() =>
    isClient ? measureWindow() : { width: 0, height: 0, scrollbarWidth: 0, scrollbarHeight: 0 },
  );

  // Persist the throttled function across renders
  const updateSizeRef = React.useRef<ReturnType<typeof throttle>>(null);

  React.useLayoutEffect(() => {
    if (!isClient) {
      return;
    }
    updateSizeRef.current = throttle(() => {
      setSize(measureWindow());
      setCount((c) => c + 1);
    });
    const handler = updateSizeRef.current;

    // Use ResizeObserver for robust resize detection
    const observer = new ResizeObserver(handler);
    observer.observe(globalThis.window.document.documentElement);

    return () => {
      if (handler) {
        handler.cancel();
      }
      observer.disconnect();
    };
  }, [isClient]);

  return { ...size, count };
}
