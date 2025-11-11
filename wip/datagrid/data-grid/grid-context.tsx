import React from 'react';

import { type FilterValue, type FilterValues } from './filter/index.ts';
import { type SortKey } from './query.ts';
import {
  decodeSort,
  getFiltersFromQueryString,
  getSortFromQueryString,
  setFiltersInQueryString,
  setSortInQueryString,
} from './query.ts';

type GridState<T = unknown> = {
  data: T[];
  sort?: SortKey;
  changeSort(this: void, sort: string): void;
  filterValues: FilterValues<T>;
  changeFilter(this: void, name: keyof T, value: FilterValue): void;
};

const GridContext = React.createContext<GridState>(null!);
export function useGrid<T = unknown>(): GridState<T> {
  return React.useContext(GridContext) as GridState<T>;
}

type GridProviderProps<T = unknown> = {
  readonly data: T[];
  readonly defaultSort?: string;
  readonly useLocation?: boolean;
  readonly children: React.ReactNode;
};

export function GridProvider<T = unknown>({
  data,
  defaultSort,
  useLocation,
  children,
}: GridProviderProps<T>): React.ReactElement {
  function baseSort(): SortKey | undefined {
    return (useLocation ? getSortFromQueryString() : undefined) ?? decodeSort(defaultSort);
  }
  const [sortCode, setSortCode] = React.useState<SortKey | undefined>(baseSort);
  const changeSort = React.useCallback(
    (columnName: string) => {
      let newSort: SortKey;

      // eslint-disable-next-line prefer-const
      newSort =
        sortCode === undefined ?
          {
            sortBy: columnName,
            sortAscending: true,
          }
        : {
            sortBy: columnName,
            sortAscending: columnName === sortCode.sortBy ? !sortCode.sortAscending : true,
          };

      setSortCode(newSort);
      if (useLocation) {
        setSortInQueryString(newSort);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortCode],
  );

  const baseFilterValues = React.useCallback(
    () => (useLocation ? getFiltersFromQueryString() : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [filterValues, setFilterValues] = React.useState<FilterValues>(baseFilterValues);
  const changeFilter = React.useCallback(
    (name: keyof T, value: FilterValue) => {
      const newFilterValues = { ...filterValues, [name]: value };
      setFilterValues(newFilterValues);
      if (useLocation) {
        setFiltersInQueryString(newFilterValues);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterValues],
  );

  const handlePopState = React.useCallback(() => {
    setSortCode(baseSort());
    setFilterValues(baseFilterValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (useLocation) {
      globalThis.addEventListener('popstate', handlePopState);
    }
    return () => {
      if (useLocation) {
        globalThis.removeEventListener('popstate', handlePopState);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation]);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GridContext.Provider value={{ data, sort: sortCode, changeSort, filterValues, changeFilter }}>
      {children}
    </GridContext.Provider>
  );
}

export default useGrid;
