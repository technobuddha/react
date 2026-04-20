import React from 'react';
import { makeStyles } from '@mui/styles';
import { isDate, isEmpty, isObject, toDate, toString } from '@technobuddha/library';
import clsx from 'clsx';

import { type DataType } from './data-grid/index.ts';

/**
 * Props for the Anything component.
 *
 * Defines properties for rendering any JavaScript value with appropriate
 * formatting and styling based on its type.
 *
 * @group Components
 * @category Anything
 */
export type AnythingParams = {
  /** Optional CSS class name to apply to the root element */
  readonly className?: string;
  /** Optional data type hint for rendering the value */
  readonly type?: DataType;
  /** Whether this is a top-level element. Affects styling for nested structures */
  readonly top?: boolean;
  /** The value to render. Can be any JavaScript value including primitives, objects, and arrays */
  readonly children: unknown;
};

/**
 * Material-UI theme interface for styling.
 *
 * @internal
 */
type Theme = {
  /** Function to calculate spacing values */
  spacing(n: number): string;
  /** Color palette for theming */
  readonly palette: Record<string, string>;
};

const useStyles = makeStyles<Theme>((theme) => ({
  array: {
    'display': 'flex',
    'flexDirection': 'row',

    '&:not($top) > *': {
      backgroundColor: theme.palette.divider,
    },
  },
  object: {
    'display': 'flex',
    'flexDirection': 'row',

    '&:not($top) > *': {
      backgroundColor: theme.palette.divider,
    },
  },
  member: {
    'padding': `0 ${theme.spacing(0.25)}`,

    '&:not(:last-child)': {
      borderRight: `1px dashed ${theme.palette.divider}`,
    },
  },
  keyValue: {
    'display': 'flex',
    'flexDirection': 'column',

    '&:not(:last-child)': {
      borderRight: `1px dotted ${theme.palette.divider}`,
    },
  },
  key: {
    fontSize: '75%',
    fontStyle: 'italic',
  },
  value: {
    '&:not(:last-child)': {
      borderRight: `1px dotted ${theme.palette.divider}`,
    },
  },
  top: {},
  null: {},
  primitive: {
    'paddingRight': theme.spacing(0.25),
    'paddingLeft': theme.spacing(0.25),

    'display': 'flex',
    'justifyContent': 'flex-end',
    'alignItems': 'center',

    '&:not($member, $value)': {
      paddingTop: theme.spacing(0.25),
      paddingBottom: theme.spacing(0.25),
    },
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
}));

/**
 * Type guard to check if a value is a plain object (not a Date).
 *
 * @param value - The value to check
 * @returns True if the value is an object but not a Date instance
 *
 * @internal
 */
function isNonDateObject(value: unknown): value is object {
  return isObject(value) && !isDate(value);
}

/**
 * A versatile component for rendering any JavaScript value with appropriate formatting.
 *
 * Automatically detects and renders different data types with appropriate styling:
 * - Null/undefined: Renders as non-breaking space
 * - Arrays: Renders items horizontally with borders between elements
 * - Objects: Renders key-value pairs with labeled keys
 * - Dates: Renders as localized date strings
 * - Numbers: Right-aligned primitive display
 * - Other primitives: Left-aligned primitive display
 *
 * Nested structures are recursively rendered with appropriate visual hierarchy.
 *
 * @param props - The component props
 * @returns A formatted representation of the value
 *
 * @example
 * ```tsx
 * \<Anything\>{42}\</Anything\>
 * ```
 *
 * @example
 * ```tsx
 * \<Anything type="date"\>{new Date()}\</Anything\>
 * ```
 *
 * @example
 * ```tsx
 * \<Anything\>{{ name: 'John', age: 30 }}\</Anything\>
 * ```
 *
 * @group Components
 * @category Anything
 */
export const Anything: React.FC<AnythingParams> = ({
  children,
  type,
  className,
  top = true,
}: AnythingParams) => {
  const css = useStyles();

  if (children == null || (isNonDateObject(children) && isEmpty(children))) {
    return <div className={clsx(className, css.null, className)}>&nbsp;</div>;
  }

  if (Array.isArray(children)) {
    return (
      <div className={clsx(css.array, className, top && css.top)}>
        {children.map((datum, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Anything key={index} className={css.member} top={false}>
            {datum}
          </Anything>
        ))}
      </div>
    );
  } else if (isNonDateObject(children)) {
    return (
      <div className={clsx(css.object, className, top && css.top)}>
        {Object.entries(children).map(([key, value]) => (
          <div key={key} className={css.keyValue}>
            <div className={css.key}>{key}</div>
            <Anything className={css.value} top={false}>
              {value}
            </Anything>
          </div>
        ))}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (type) {
    case 'number': {
      return <div className={clsx(className, css.primitive, css.right)}>{toString(children)}</div>;
    }

    case 'date': {
      return (
        <div className={clsx(className, css.primitive, css.left)}>
          {toDate(children).toLocaleDateString()}
        </div>
      );
    }

    default: {
      return <div className={clsx(className, css.primitive, css.left)}>{toString(children)}</div>;
    }
  }
};

export default Anything;
