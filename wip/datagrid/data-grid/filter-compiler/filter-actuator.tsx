import React from 'react';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

import { type FilterActuatorClasses, type FilterActuatorStyles } from '../filter/index.ts';

export type FilterActuatorProps = {
  readonly classes?: FilterActuatorClasses;
  readonly styles?: FilterActuatorStyles;
  onButtonClick?(this: void): void;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly Icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
        // eslint-disable-next-line react/jsx-no-bind
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
