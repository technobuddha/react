import { isString } from '@technobuddha/library';

import { type FilterValue } from '../../filter/index.ts';

export const normalizeFilterValue = (filterValue: FilterValue): string | null =>
  Array.isArray(filterValue) ?
    filterValue.length > 0 ?
      filterValue[0]
    : null
  : filterValue;

export const normalizeFilterArray = (filterValue: FilterValue): string[] | null =>
  Array.isArray(filterValue) ?
    filterValue.length > 0 ?
      filterValue
    : null
  : isString(filterValue) ? [filterValue]
  : null;
