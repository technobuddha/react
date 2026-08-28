import { isArray } from '@technobuddha/library';

export function getUniqueValues<T = unknown>(data: T[], name: keyof T): string[] {
  const set = new Set<string>();
  for (const datum of data) {
    const v = datum[name];

    if (v != null) {
      if (isArray(v)) {
        for (const vv of v) {
          if (vv != null) {
            set.add(vv.toString());
          }
        }
      } else if (v != null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set.add((v as any)?.toString?.());
      }
    }
  }

  return Array.from(set);
}

export default getUniqueValues;
