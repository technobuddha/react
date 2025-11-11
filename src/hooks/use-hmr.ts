import React from 'react';
import { type ViteHotContext } from 'vite/types/hot.js';

export function hot(): ViteHotContext | undefined {
  return import.meta.hot;
}

/**
 * React hook that tracks Hot Module Replacement (HMR) updates in a Vite development environment.
 *
 * ::: danger
 * This hook relies on Vite's HMR API and will not function outside of a Vite development environment.
 * :::
 *
 * Each time a HMR update occurs, the returned number increments, allowing components to respond to HMR events.
 *
 * @returns The current HMR update count.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const hmrCount = useHMR();
 *   return <div>HMR updates: {hmrCount}</div>;
 * }
 * ```
 * @remarks
 * In a non-Vite environment or in a production environment, this hook will always return 0, and
 * never update.
 * @group React
 * @category Hooks
 */
export function useHMR(): number {
  const [hmr, setHMR] = React.useState(0);

  React.useEffect(() => {
    const handleHMR = (): void => {
      setHMR((prev) => prev + 1);
    };

    hot()?.on('vite:beforeUpdate', handleHMR);

    return () => {
      hot()?.off('vite:beforeUpdate', handleHMR);
    };
  }, []);

  return hmr;
}
