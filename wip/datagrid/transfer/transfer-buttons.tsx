import React from 'react';
import { Box, Button, Divider } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

type TransferButtonsProps = {
  readonly classes?: TransferButtonClasses;
  readonly styles?: TransferButtonStyles;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  readonly dispatch: React.MutableRefObject<DispatchFunction | null>;
  onRAllClick?(this: void): void;
  onRSelClick?(this: void): void;
  onLSelClick?(this: void): void;
  onLAllClick?(this: void): void;
  readonly children?: never;
};

export type TransferButtonClasses = {
  root: string;
  button: string;
  divider: string;
};
export type TransferButtonStyles = { [key in keyof TransferButtonClasses]: React.CSSProperties };

export type DispatchFunction = (args: {
  rAll?: boolean;
  rSel?: boolean;
  lAll?: boolean;
  lSel?: boolean;
}) => void;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    height: '100%',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
  divider: {
    margin: theme.spacing(3, 0),
    width: '100%',
  },
}));

const TransferButtons: React.FC<TransferButtonsProps> = ({
  classes,
  styles,
  dispatch,
  onRAllClick,
  onRSelClick,
  onLSelClick,
  onLAllClick,
}) => {
  const css = useStyles();
  const [rAllDisabled, setRAllDisabled] = React.useState(true);
  const [rSelDisabled, setRSelDisabled] = React.useState(true);
  const [lAllDisabled, setLAllDisabled] = React.useState(true);
  const [lSelDisabled, setLSelDisabled] = React.useState(true);
  const handleRAllClick = React.useCallback(() => onRAllClick?.(), [onRAllClick]);
  const handleRSelClick = React.useCallback(() => onRSelClick?.(), [onRSelClick]);
  const handleLSelClick = React.useCallback(() => onLSelClick?.(), [onLSelClick]);
  const handleLAllClick = React.useCallback(() => onLAllClick?.(), [onLAllClick]);

  dispatch.current = ({ rAll, rSel, lAll, lSel }: Parameters<DispatchFunction>[0]) => {
    if (rAll !== undefined) {
      setRAllDisabled(rAll);
    }
    if (rSel !== undefined) {
      setRSelDisabled(rSel);
    }
    if (lSel !== undefined) {
      setLSelDisabled(lSel);
    }
    if (lAll !== undefined) {
      setLAllDisabled(lAll);
    }
  };

  return (
    <Box className={clsx(css.root, classes?.root)} style={styles?.root}>
      {/* eslint-disable-next-line github/a11y-aria-label-is-well-formatted */}
      <Button
        className={clsx(css.button, classes?.button)}
        style={styles?.button}
        disabled={rAllDisabled}
        variant="outlined"
        size="small"
        onClick={handleRAllClick}
        aria-label="move all right"
      >
        ≫
      </Button>
      {/* eslint-disable-next-line github/a11y-aria-label-is-well-formatted */}
      <Button
        className={clsx(css.button, classes?.button)}
        style={styles?.button}
        disabled={rSelDisabled}
        variant="outlined"
        size="small"
        onClick={handleRSelClick}
        aria-label="move selected right"
      >
        &gt;
      </Button>
      <Divider className={clsx(css.divider, classes?.divider)} style={styles?.divider} />
      {/* eslint-disable-next-line github/a11y-aria-label-is-well-formatted */}
      <Button
        className={clsx(css.button, classes?.button)}
        style={styles?.button}
        disabled={lSelDisabled}
        variant="outlined"
        size="small"
        onClick={handleLSelClick}
        aria-label="move selected left"
      >
        &lt;
      </Button>
      {/* eslint-disable-next-line github/a11y-aria-label-is-well-formatted */}
      <Button
        className={clsx(css.button, classes?.button)}
        style={styles?.button}
        disabled={lAllDisabled}
        variant="outlined"
        size="small"
        onClick={handleLAllClick}
        aria-label="move all left"
      >
        ≪
      </Button>
    </Box>
  );
};

export default TransferButtons;
