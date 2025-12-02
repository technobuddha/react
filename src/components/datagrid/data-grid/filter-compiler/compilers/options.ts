import type React from 'react';

/**
 * Base options for filter compilers
 *
 * @group Components
 * @category DataGrid
 */
export type CompilerOptions = {
  /** Optional ref to a function that clears the filter state */
  clear?: React.RefObject<() => void>;
};
