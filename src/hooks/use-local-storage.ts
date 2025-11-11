import React from 'react';
import { isFunction } from '@technobuddha/library';
import { type JsonValue } from 'type-fest';

/**
 * Similar to `React.useState`, returns a stateful value and a function to update it. The state
 * value is also saved in `localStorage`.
 *
 * Only values that are valid `JsonValue` (from type-fest) are supported, as all values are serialized
 * with `JSON.stringify`.
 *
 * When initializing, if the key exists in `localStorage`, the stored value is used. Otherwise,
 * the `initialState` value is used.
 *
 * @param key - The keyname to use for storing the value in `localStorage`.
 * @param initialState - Initial state value or a function returning the initial state.
 * @returns [ stateValue, setterFunction ].
 *
 * @example
 * ```typescript
 * function Counter() {
 *   const [count, setCount] = useLocalStorage('count', 0);
 *   return (
 *     <div>
 *       <div>Count: {'{'}count{'}'}</div>
 *       <button onClick={() => setCount(c => c + 1)}>Increment</button>
 *       <button onClick={() => setCount(0)}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 * @group React
 * @category Hooks
 */
export function useLocalStorage<T extends JsonValue>(
  key: string,
  initialState: T | (() => T),
): readonly [T, (newValue: T | ((oldValue: T) => T)) => void] {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return isFunction(initialState) ? (initialState as () => T)() : initialState;
    } catch {
      return isFunction(initialState) ? (initialState as () => T)() : initialState;
    }
  });

  const setter = React.useMemo(
    () => (newValue: T | ((oldValue: T) => T)) => {
      setValue((oldValue) => {
        const val = isFunction(newValue) ? newValue(oldValue) : newValue;

        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch {}

        return val;
      });
    },
    [setValue],
  );

  return [value, setter] as const;
}
