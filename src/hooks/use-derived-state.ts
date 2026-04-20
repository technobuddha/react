import React from 'react';
import { changed, isFunction } from '@technobuddha/library';

/**
 * Like `useState`, but the value is re-initialized from `initialValue` whenever `deps` change.
 * Allows both derived (from dependencies) and manual updates. Useful for state that depends on props or other values,
 * but can also be set directly.
 *
 * @param initialValue - Initial value or function to compute value from previous state.
 * @param deps - Dependency array; when changed, value is recalculated from `initialValue`.
 * @returns [value, setter] tuple, like `useState`.
 *
 * @example
 * ```typescript
 * export function Counter({ start }: { start: number }) {
 *   // Allow the user to change the counter, but when the start prop changes we always start over.
 *   const [count, setCount] = useDerivedState(() => start + 1, [start]);
 *
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <button onClick={() => setCount(c => c + 1)}>Increment</button>
 *       <button onClick={() => setCount(() => 0)}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 * @group Hooks
 * @category UseDerivedState
 */
export function useDerivedState<T>(
  initialValue: T | ((prevValue: T) => T),
  deps: readonly unknown[],
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const value = React.useRef<T>(undefined!);
  const depends = React.useRef(deps);
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  const setter = React.useMemo(
    () => (newValue: T | ((prevValue: T) => T)) => {
      value.current = isFunction(newValue) ? newValue(value.current) : newValue;
      forceUpdate();
    },
    [value],
  );

  if (value.current === undefined || changed(deps, depends.current)) {
    value.current = isFunction(initialValue) ? initialValue(value.current) : initialValue;
    depends.current = deps;
  }

  return [value.current, setter];
}
