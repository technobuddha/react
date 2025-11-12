/* eslint-disable react/no-multi-comp */
import React from 'react';
import { Checkbox } from '@mui/material';

import { useRow } from './row-context.tsx';

type BaseSelectionIndicatorProps = {
  readonly className?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  readonly style?: React.CSSProperties;
  readonly children?: never;
};

export type RowSelectionIndicatorProps<T = unknown> = BaseSelectionIndicatorProps & {
  readonly datum: T;
};

export function RowSelectionIndicator<T = unknown>({
  datum,
  className,
  // style,
}: RowSelectionIndicatorProps<T>): React.ReactElement {
  const { setSelected, getSelected } = useRow();

  const handleCheckboxChange = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSelected(datum, checked);
    },
    [datum, setSelected],
  );

  return (
    <Checkbox
      size="small"
      classes={{ root: className }}
      // styles={{ root: style}}
      onChange={handleCheckboxChange}
      checked={getSelected(datum)}
      color="secondary"
    />
  );
}

export type MasterSelectionIndicatorProps<T = unknown> = BaseSelectionIndicatorProps & {
  readonly data: T[];
};

export function MasterSelectionIndicator<T = unknown>({
  data,
  className,
  // style,
}: MasterSelectionIndicatorProps<T>): React.ReactElement {
  const { setSelected, countSelected } = useRow();
  const { selected, unselected } = countSelected(data);

  const handleMasterChange = React.useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setSelected(data, checked);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  return (
    <Checkbox
      size="small"
      classes={{ root: className }}
      // style={style}
      onChange={handleMasterChange}
      checked={selected > 0 && unselected === 0}
      indeterminate={selected > 0 && unselected > 0}
      color="secondary"
    />
  );
}
