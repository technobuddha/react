import React from 'react';
import {
  type ElementSize,
  measure,
  type ScrollbarSize,
  scrollbarSize,
} from '@technobuddha/library/browser';

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type SizeScrollbarRenderProps = ElementSize & ScrollbarSize;

export type SizeScrollbarProps = Omit<DivProps, 'children'> & {
  readonly width?: string | number;
  readonly height?: string | number;
  children(this: void, props: ElementSize & ScrollbarSize): React.ReactNode;
};

export const SizeScrollbar: React.FC<SizeScrollbarProps> = ({
  width = '100%',
  height = '100%',
  style,
  children,
}) => {
  const [state, setState] = React.useState<ElementSize & ScrollbarSize>({
    width: 0,
    height: 0,
    scrollbarWidth: 0,
    scrollbarHeight: 0,
  });
  const div = React.useRef<HTMLDivElement>(null);
  const observer = React.useMemo(
    () =>
      new ResizeObserver(() => {
        if (div.current) {
          setState({ ...measure(div.current), ...scrollbarSize() });
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

  const Children = children;

  return (
    <div style={{ ...style, width, height }} ref={div}>
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
