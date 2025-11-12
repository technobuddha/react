import React from 'react';
import { type ElementSize, measure } from '@technobuddha/library';

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type SizeRenderProps = ElementSize;

export type SizeProps = Omit<DivProps, 'children'> & {
  readonly width?: string | number;
  readonly height?: string | number;
  children(this: void, props: SizeRenderProps): React.ReactNode;
};

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
