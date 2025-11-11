/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import React from 'react';
import { memoize, type Memoized } from '@technobuddha/library';

/**
 * Returns a memoized version of the provided callback function, which caches results based on the given key.
 * The memoized callback is recomputed only when the specified dependencies change.
 *
 * @param callback - A function that takes a key and returns a function to be memoized.
 * @param dependencies - An array of dependencies that determine when to recompute the memoized callback.
 * @returns A memoized function that caches results based on the key.
 */
export function useMemoizedCallback<Key, Return extends Function>(
  callback: (key: Key) => Return,
  dependencies: React.DependencyList,
): Memoized<Key, never, Return> {
  return React.useMemo(() => memoize(callback), dependencies);
}
