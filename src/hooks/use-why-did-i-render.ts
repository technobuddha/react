/* eslint-disable no-console */
import React from 'react';

/**
 * Logs to the console whenever the given component re-renders and its props have changed.
 * Useful for debugging unnecessary or unexpected re-renders during development.
 *
 * @param name - The name of the component (for logging).
 * @param props - The current props object to track for changes.
 *
 * @example
 * ```typescript
 * function MyComponent(props: { value: number }) {
 *   useWhyDidIRender('MyComponent', props);
 *   return <div>{props.value}</div>;
 * }
 * ```
 * @group React
 * @category Hooks
 */
export function useWhyDidIRender(name: string, props: Record<string, unknown>): void {
  const previousProps = React.useRef<Record<string, unknown> | undefined>(undefined);

  React.useEffect(() => {
    if (previousProps.current) {
      console.log('[WDIR]:', name);
      for (const key of Object.keys({ ...previousProps.current, ...props })) {
        if (previousProps.current[key] !== props[key]) {
          console.log('...', key);
        }
      }

      console.log(':[WDIR]');
    }

    previousProps.current = props;
  });
}
