import { isArray } from '@technobuddha/library';
import queryString, { type ParsedQuery } from 'query-string';

/**
 * Represents a sort configuration.
 *
 * @group Components
 * @category DataGrid
 */
export type SortKey = {
  /** The column name to sort by */
  sortBy: string;
  /** Whether to sort in ascending order */
  sortAscending: boolean;
};

/**
 * Query parameter key for sort state.
 *
 * @internal
 */
const KEY_SORT = 'sort';

/**
 * Decodes a sort string into a SortKey object.
 *
 * The sort string format is:
 * - Column name for ascending sort (e.g., 'name')
 * - Tilde prefix for descending sort (e.g., '~name')
 *
 * @param sortBy - The sort string to decode, or null/undefined
 * @returns A SortKey object, or undefined if input is null/undefined
 *
 * @example
 * ```typescript
 * decodeSort('name');    // { sortBy: 'name', sortAscending: true }
 * decodeSort('~age');    // { sortBy: '~age', sortAscending: false }
 * decodeSort(null);      // undefined
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function decodeSort(sortBy: string | null | undefined): SortKey | undefined {
  if (sortBy) {
    if (sortBy.startsWith('~')) {
      return { sortBy, sortAscending: false };
    }

    return { sortBy, sortAscending: true };
  }

  return undefined;
}

/**
 * Encodes a SortKey object into a sort string.
 *
 * @param sortBy - The SortKey to encode, or undefined
 * @returns A sort string, or undefined if input is undefined
 *
 * @internal
 */
function encodeSort(sortBy: SortKey | undefined): string | undefined {
  if (sortBy) {
    if (!sortBy.sortAscending) {
      return `~${sortBy.sortBy}`;
    }
    return sortBy.sortBy;
  }

  return undefined;
}

/**
 * Retrieves the sort configuration from the current URL query string.
 *
 * Reads the 'sort' query parameter and decodes it into a SortKey object.
 * If the parameter contains multiple values (array), uses the first one.
 *
 * @returns The current sort configuration, or undefined if not set
 *
 * @example
 * ```typescript
 * // URL: ?sort=name
 * getSortFromQueryString(); // { sortBy: 'name', sortAscending: true }
 *
 * // URL: ?sort=~age
 * getSortFromQueryString(); // { sortBy: '~age', sortAscending: false }
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function getSortFromQueryString(): SortKey | undefined {
  const { [KEY_SORT]: sort } = queryString.parse(location.search);

  if (!sort) {
    return undefined;
  }
  if (isArray(sort)) {
    return decodeSort(sort[0]);
  }

  return decodeSort(sort);
}

/**
 * Updates the URL query string with the given sort configuration.
 *
 * Preserves existing query parameters and updates only the 'sort' parameter.
 * Uses browser history API to update the URL without page reload.
 *
 * @param sort - The sort configuration to persist, or undefined to remove sorting
 *
 * @example
 * ```typescript
 * setSortInQueryString({ sortBy: 'name', sortAscending: true });
 * // URL becomes: ?sort=name&...other params
 *
 * setSortInQueryString({ sortBy: 'age', sortAscending: false });
 * // URL becomes: ?sort=~age&...other params
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function setSortInQueryString(sort: SortKey | undefined): void {
  const search: Record<string, unknown> = queryString.parse(location.search);

  search[KEY_SORT] = encodeSort(sort);
  history.pushState(
    null,
    '',
    `${location.pathname}?${queryString.stringify(search)}${location.hash}`,
  );
}

/**
 * Retrieves filter values from the current URL query string.
 *
 * Extracts all query parameters except the 'sort' parameter.
 * Returns an object mapping filter names to their values.
 *
 * @returns An object containing all filter values from the query string
 *
 * @example
 * ```typescript
 * // URL: ?name=John&age=30&sort=name
 * getFiltersFromQueryString();
 * // Returns: { name: 'John', age: '30' }
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function getFiltersFromQueryString(): Record<string, string | (string | null)[] | null> {
  const { [KEY_SORT]: sort, ...filterValues } = Object.fromEntries(
    Object.entries(queryString.parse(location.search)).map(([k, v]) => [k, v ?? null]),
  );
  return filterValues;
}

/**
 * Updates the URL query string with the given filter values.
 *
 * Replaces all filter parameters while preserving the current sort parameter.
 * Uses browser history API to update the URL without page reload.
 *
 * @param filterValues - Object mapping filter names to their values
 *
 * @example
 * ```typescript
 * setFiltersInQueryString({
 *   name: 'John',
 *   age: '30',
 * });
 * // URL becomes: ?name=John&age=30&sort=...existing sort
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export function setFiltersInQueryString(filterValues: ParsedQuery): void {
  const sort = getSortFromQueryString();
  const search = { ...filterValues, [KEY_SORT]: sort };

  history.pushState(
    null,
    '',
    `${location.pathname}?${queryString.stringify(search)}${location.hash}`,
  );
}
