import React from 'react';
import { isFunction } from '@technobuddha/library';

/**
 * useConst returns a constant value for the lifetime of the component.
 *
 * @param initialValue - The value or function to be made constant
 * @returns The constant value
 *
 * @example
 * const foo = useConst('bar');
 *
 * @example
 * // Using with a function initializer
 * const foo = useConst(() =\> expensiveComputation());
 *
 * @group Hooks
 * @category UseConst
 */
export function useConst<T>(initialValue: T | (() => T)): T {
  const value = React.useRef<T>(isFunction(initialValue) ? initialValue() : initialValue);

  return value.current;
}
