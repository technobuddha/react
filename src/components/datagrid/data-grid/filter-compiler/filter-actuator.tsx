import React from 'react';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import { type FilterActuatorClasses, type FilterActuatorStyles } from '../filter/index.ts';

/**
 * Props for the FilterActuator component
 *
 * @group Components
 * @category DataGrid
 */
export type FilterActuatorProps = {
  /** Optional CSS class overrides for styling the actuator components */
  readonly classes?: FilterActuatorClasses;
  /** Optional inline style overrides for the actuator components */
  readonly styles?: FilterActuatorStyles;
  /** Callback function invoked when the filter button is clicked */
  onButtonClick?(this: void): void;
  /** Optional icon component to display on the filter button */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly Icon?: React.ComponentType<{
    /** Optional CSS class name for the icon element */
    className?: string;
    /** Optional inline styles for the icon element */
    style?: React.CSSProperties;
  }>;
  /** The title text to display on the filter button */
  readonly title: string;
};

const useFilterActuatorStyles = makeStyles((theme) => ({
  root: {
    'padding': theme.spacing(0.5),
    '&:not(:first-child)': {
      marginLeft: theme.spacing(0.25),
    },
  },
  button: {
    border: `solid 1px ${theme.palette.grey[900]}`,
    borderRadius: '10px',
    backgroundColor: theme.palette.grey[500],
  },
  icon: {
    color: theme.palette.grey[200],
  },
  title: {
    color: theme.palette.grey[200],
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
  },
}));

/**
 * A button component that triggers filter actions in the DataGrid.
 *
 * Renders a styled button with optional icon and title text. When clicked,
 * it invokes the provided callback to display filter UI or execute filter logic.
 * Used by various filter compilers to provide a consistent filter activation interface.
 *
 * @param props - The component props
 * @returns A styled button component for activating filters
 *
 * @example
 * ```tsx
 * \<FilterActuator
 *   title="Filter Users"
 *   Icon={FilterIcon}
 *   onButtonClick={() => setDialogOpen(true)}
 * /\>
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export const FilterActuator: React.FC<FilterActuatorProps> = ({
  classes,
  styles,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Icon,
  onButtonClick,
  title,
}) => {
  const css = useFilterActuatorStyles();

  const handleButtonClick = (_event: React.MouseEvent<HTMLButtonElement>): void => {
    onButtonClick?.();
  };

  return (
    <Box className={clsx(css.root, classes?.root)} style={styles?.root}>
      <Button
        className={clsx(css.button, classes?.button)}
        style={styles?.button}
        onClick={handleButtonClick}
      >
        {Icon != null && <Icon className={clsx(css.icon, classes?.icon)} style={styles?.icon} />}
        <Box className={clsx(css.title, classes?.title)} style={styles?.title}>
          {title}
        </Box>
      </Button>
    </Box>
  );
};

export default FilterActuator;
