import React from 'react';

import { useGrid } from '../grid-context.tsx';

export type Filter<T = unknown> = {
  name: keyof T;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Actuator: React.ComponentType<FilterActuatorProps>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Indicator?: React.ComponentType<FilterIndicatorProps>;
  execute(data: T[], value: FilterValue): T[];
};

export type FilterValue = string | string[] | null;
export type FilterValues<T = unknown> = Record<keyof T, FilterValue>;

export type FilterActuatorProps = {
  classes?: FilterActuatorClasses;
  styles?: FilterActuatorStyles;
};

export type FilterIndicatorProps = {
  classes?: FilterIndicatorClasses;
  styles?: FilterIndicatorStyles;
};

export type FilterActuatorClasses = {
  root: string;
  button: string;
  icon: string;
  title: string;
};
export type FilterActuatorStyles = { [key in keyof FilterActuatorClasses]: React.CSSProperties };

export type FilterIndicatorClasses = {
  root: string;
};
export type FilterIndicatorStyles = { [key in keyof FilterIndicatorClasses]: React.CSSProperties };

function queryStringizeFilterValue<T = unknown>(filterValues: FilterValues<T>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(filterValues).map(([k, v]) => {
        if (v === null) {
          return [k, null];
        } else if (Array.isArray(v)) {
          return [k, v.join('&')];
        }

        return [k, v];
      }),
    ),
  );
}

type FiltererProps<T = unknown> = {
  filters: Filter<T>[];
  children(this: void, renderProps: FiltererRenderProps<T>): React.ReactElement;
};

export type FiltererRenderProps<T = unknown> = {
  data: T[];
};

export function Filterer<T = unknown>({ filters, children }: FiltererProps<T>): React.ReactElement {
  const { data, filterValues } = useGrid<T>();
  const filteredData = React.useMemo(() => {
    let fData = [...data];
    for (const filter of filters) {
      fData = filter.execute(fData, filterValues[filter.name]);
    }
    return fData;
  }, [data, filters, queryStringizeFilterValue(filterValues)]);

  return children({ data: filteredData });
}

export default Filterer;
