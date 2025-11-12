import queryString, { type ParsedQuery } from 'query-string';

export type SortKey = { sortBy: string; sortAscending: boolean };

const KEY_SORT = 'sort';

export function decodeSort(sortBy: string | null | undefined): SortKey | undefined {
  if (sortBy) {
    if (sortBy.startsWith('~')) {
      return { sortBy, sortAscending: false };
    }

    return { sortBy, sortAscending: true };
  }

  return undefined;
}

function encodeSort(sortBy: SortKey | undefined): string | undefined {
  if (sortBy) {
    if (!sortBy.sortAscending) {
      return `~${sortBy.sortBy}`;
    }
    return sortBy.sortBy;
  }

  return undefined;
}

export function getSortFromQueryString(): SortKey | undefined {
  const { [KEY_SORT]: sort } = queryString.parse(location.search);

  if (!sort) {
    return undefined;
  } else if (Array.isArray(sort)) {
    return decodeSort(sort[0]);
  }

  return decodeSort(sort);
}

export function setSortInQueryString(sort: SortKey | undefined): void {
  const search: Record<string, unknown> = queryString.parse(location.search);

  search[KEY_SORT] = encodeSort(sort);
  history.pushState(
    null,
    '',
    `${location.pathname}?${queryString.stringify(search)}${location.hash}`,
  );
}

export function getFiltersFromQueryString(): Record<string, string | (string | null)[] | null> {
  const { [KEY_SORT]: sort, ...filterValues } = Object.fromEntries(
    Object.entries(queryString.parse(location.search)).map(([k, v]) => [k, v ?? null]),
  );
  return filterValues;
}

export function setFiltersInQueryString(filterValues: ParsedQuery): void {
  const sort = getSortFromQueryString();
  const search = { ...filterValues, [KEY_SORT]: sort };

  history.pushState(
    null,
    '',
    `${location.pathname}?${queryString.stringify(search)}${location.hash}`,
  );
}
