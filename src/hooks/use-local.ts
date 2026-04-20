import React from 'react';
import { isFunction } from '@technobuddha/library';

/**
 * Provides a mutable value that persists for the lifetime of the component, similar to `useRef`,
 * but with a convenient setter function like `useState`. Updating the value does not cause a re-render.
 *
 * Useful for storing local, non-UI state such as timers, cached values, or other data that should
 * persist across renders but not trigger updates to the UI.
 *
 * @param initialState - Initial value or a function returning the initial value.
 * @returns [value, setter] tuple. The setter updates the value but does not re-render the component.
 *
 * @example
 * ```typescript
 * function Timer() {
 *   const [startTime, setStartTime] = useLocal(() => Date.now());
 *   // This value will persist across renders, but updating it will not re-render the component.
 *   return (
 *     <button onClick={() => setStartTime(Date.now())}>
 *       Reset Timer
 *     </button>
 *   );
 * }
 * ```
 * @group Hooks
 * @category UseLocal
 */
export function useLocal<T>(initialState: T | (() => T)): [T, (set: T | ((prev: T) => T)) => void] {
  const localRef = React.useRef(isFunction(initialState) ? initialState() : initialState);
  const setter = React.useMemo(
    () => (set: T | ((prev: T) => T)) => {
      localRef.current = isFunction(set) ? set(localRef.current) : set;
    },
    [localRef],
  );

  return [localRef.current, setter];
}
