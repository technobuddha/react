import React from 'react';
import { Box, Button, Divider } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

/**
 * Props for the TransferButtons component.
 *
 * @internal
 */
type TransferButtonsProps = {
  /** Optional CSS class overrides for buttons and container */
  readonly classes?: TransferButtonClasses;
  /** Optional inline style overrides for buttons and container */
  readonly styles?: TransferButtonStyles;
  /** Mutable ref to receive the dispatch function for enabling/disabling buttons */
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  readonly dispatch: React.MutableRefObject<DispatchFunction | null>;
  /** Callback invoked when "move all right" button is clicked */
  onRAllClick?(this: void): void;
  /** Callback invoked when "move selected right" button is clicked */
  onRSelClick?(this: void): void;
  /** Callback invoked when "move selected left" button is clicked */
  onLSelClick?(this: void): void;
  /** Callback invoked when "move all left" button is clicked */
  onLAllClick?(this: void): void;
  /** Children are not supported */
  readonly children?: never;
};

/**
 * CSS class overrides for the TransferButtons component.
 *
 * @group Components
 * @category Transfer
 */
export type TransferButtonClasses = {
  /** Class for the root container */
  root: string;
  /** Class for button elements */
  button: string;
  /** Class for the divider element */
  divider: string;
};

/**
 * Inline style overrides for the TransferButtons component.
 *
 * @group Components
 * @category Transfer
 */
export type TransferButtonStyles = { [key in keyof TransferButtonClasses]: React.CSSProperties };

/**
 * Function type for updating button enabled/disabled states.
 *
 * Called by the parent Transfer component to control which buttons should be enabled
 * based on the current selection state of both lists.
 *
 * @group Components
 * @category Transfer
 */
export type DispatchFunction = (args: {
  /** Whether to disable the "move all right" button (true = disabled) */
  rAll?: boolean;
  /** Whether to disable the "move selected right" button (true = disabled) */
  rSel?: boolean;
  /** Whether to disable the "move all left" button (true = disabled) */
  lAll?: boolean;
  /** Whether to disable the "move selected left" button (true = disabled) */
  lSel?: boolean;
}) => void;

/**
 * Material-UI styles for the TransferButtons component.
 *
 * @internal
 */
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

/**
 * Component that renders the transfer control buttons between two lists.
 *
 * Displays four buttons for transferring items:
 * - ≫ (Move all right): Transfers all items from left to right list
 * - \> (Move selected right): Transfers selected items from left to right
 * - \< (Move selected left): Transfers selected items from right to left
 * - ≪ (Move all left): Transfers all items from right to left
 *
 * The component manages button disabled states internally and exposes a dispatch
 * function via ref that allows the parent component to control which buttons
 * should be enabled based on the current selection state.
 *
 * Button states:
 * - "Move all" buttons disabled when source list is empty
 * - "Move selected" buttons disabled when no items are selected in source list
 *
 * @param props - Configuration props for the transfer buttons
 * @returns A vertical column of transfer control buttons
 *
 * @internal
 */
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

/**
 * Default export of the TransferButtons component.
 *
 * @internal
 */
export default TransferButtons;
