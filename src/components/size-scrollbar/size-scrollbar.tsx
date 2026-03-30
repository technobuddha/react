import React from 'react';
import {
  type ElementSize,
  measure,
  type ScrollbarSize,
  scrollbarSize,
} from '@technobuddha/library/browser';

/**
 * Render props containing element dimensions and scrollbar measurements
 *
 * @group Components
 * @category Size
 */
export type SizeScrollbarRenderProps = ElementSize & ScrollbarSize;

/**
 * Props for the SizeScrollbar component
 *
 * @group Components
 * @category Components
 */
export type SizeScrollbarProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children'
> & {
  /** Optional width of the container (default: '100%') */
  readonly width?: string | number;
  /** Optional height of the container (default: '100%') */
  readonly height?: string | number;
  /** Render prop function receiving element size and scrollbar dimensions */
  children(this: void, props: ElementSize & ScrollbarSize): React.ReactNode;
};

/**
 * Component that provides element dimensions and scrollbar size to children via render props
 *
 * Uses ResizeObserver to track the container's size and measures the browser's scrollbar
 * dimensions. Passes both measurements to the render prop function. Observes both the
 * container element and document body for size changes.
 *
 * @param props - The component props
 * @returns A div that tracks its size and provides dimensions to children
 *
 * @example
 * ```tsx
 * \<SizeScrollbar width="100%" height="400px"\>
 *   {({ width, height, scrollbarWidth, scrollbarHeight }) => (
 *     \<div\>Container: {width}x{height}, Scrollbar: {scrollbarWidth}x{scrollbarHeight}\</div\>
 *   )}
 * \</SizeScrollbar\>
 * ```
 *
 * @group Components
 * @category Size
 */
export const SizeScrollbar: React.FC<SizeScrollbarProps> = ({
  width = '100%',
  height = '100%',
  style,
  children,
}) => {
  const [state, setState] = React.useState({
    width: 0,
    height: 0,
    scrollbarWidth: 0,
    scrollbarHeight: 0,
  });
  const divRef = React.useRef<HTMLDivElement>(null);
  const observer = React.useMemo(
    () =>
      new ResizeObserver(() => {
        if (divRef.current) {
          setState({ ...measure(divRef.current), ...scrollbarSize() });
        }
      }),
    [],
  );

  React.useEffect(() => {
    if (divRef.current) {
      observer.observe(divRef.current);
    }
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react/exhaustive-deps, react/refs
  }, [divRef.current]);

  const Children = children;

  return (
    <div style={{ ...style, width, height }} ref={divRef}>
      {state.width === 0 || state.height === 0 ?
        '\u00A0'
      : <Children
          width={state.width}
          height={state.height}
          scrollbarWidth={state.scrollbarWidth}
          scrollbarHeight={state.scrollbarHeight}
        />
      }
    </div>
  );
};
