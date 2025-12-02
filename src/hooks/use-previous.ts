import React from 'react';
import { isFunction } from '@technobuddha/library';

/**
 * Tracks the previous value of a variable across renders.
 *
 * On the first render, returns `undefined`. On subsequent renders, returns the value from the previous render.
 * If you pass a function, it will be called with the previous value to compute the new value.
 *
 * Useful for comparing previous and current values, animations, or debugging.
 *
 * @param value - The current value, or a function that receives the previous value and returns the new value.
 * @returns The previous value.
 *
 * @example
 * ```typescript
 * function Example({ count }: { count: number }) {
 *   const prevCount = usePrevious(count);
 *   return (
 *     <div>
 *       <div>Current: {'{'}count{'}'}</div>
 *       <div>Previous: {'{'}prevCount{'}'}</div>
 *     </div>
 *   );
 * }
 * ```
 * @group Hooks
 * @category UsePrevious
 */
export function usePrevious<T>(value: T | ((prevValue: T | undefined) => T)): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  const v = isFunction(value) ? value(ref.current) : value;

  React.useEffect(() => {
    ref.current = v;
  }, [v]);

  return ref.current;
}
