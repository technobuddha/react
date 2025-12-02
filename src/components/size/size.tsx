import React from 'react';
import { type ElementSize, measure } from '@technobuddha/library/browser';

/**
 * Props passed to the render function of the Size component.
 *
 * Contains the current dimensions of the container element.
 *
 * @group Components
 * @category Size
 */
export type SizeRenderProps = ElementSize;

/**
 * Props for the Size component.
 *
 * Extends standard div props while replacing children with a render function
 * that receives the current element dimensions.
 *
 * @group Components
 * @category Size
 */
export type SizeProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children'
> & {
  /** The width of the container. Defaults to '100%' */
  readonly width?: string | number;
  /** The height of the container. Defaults to '100%' */
  readonly height?: string | number;
  /**
   * Render function that receives the current dimensions
   *
   * @param props - Object containing width and height measurements
   * @returns React elements to render inside the container
   */
  children(this: void, props: SizeRenderProps): React.ReactNode;
};

/**
 * A component that measures its container size and provides dimensions to its children.
 *
 * Uses ResizeObserver to track element size changes and passes the current width
 * and height to a render function. The component re-renders whenever the container
 * dimensions change, allowing children to respond to size updates.
 *
 * The component initially renders a non-breaking space until dimensions are measured,
 * then calls the children render function with the actual dimensions.
 *
 * @param props - The component props
 * @returns A div container that tracks its size and renders children with dimension data
 *
 * @example
 * ```tsx
 * \<Size width="100%" height={400}\>
 *   {({ width, height }) => (
 *     \<div\>Container size: {width}x{height}\</div\>
 *   )}
 * \</Size\>
 * ```
 *
 * @example
 * ```tsx
 * \<Size\>
 *   {({ width, height }) => (
 *     \<canvas width={width} height={height} /\>
 *   )}
 * \</Size\>
 * ```
 *
 * @group Components
 * @category Size
 */
export const Size: React.FC<SizeProps> = ({ width = '100%', height = '100%', style, children }) => {
  const [state, setState] = React.useState<ElementSize>({ width: 0, height: 0 });
  const div = React.useRef<HTMLDivElement>(null);
  const observer = React.useMemo(
    () =>
      new ResizeObserver(() => {
        if (div.current) {
          setState(measure(div.current));
        }
      }),
    [],
  );

  React.useEffect(() => {
    if (div.current) {
      observer.observe(div.current);
    }
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [div.current]);

  return (
    <div style={{ ...style, width, height }} ref={div}>
      {state.width === 0 || state.height === 0 ?
        '\u00A0'
      : children({ width: state.width, height: state.height })}
    </div>
  );
};
