import React from 'react';
import { makeStyles } from '@mui/styles';
import { isDate, isEmpty, isObject, toDate, toString } from '@technobuddha/library';
import clsx from 'clsx';

import { type DataType } from './data-grid/index.ts';

export type AnythingParams = {
  readonly className?: string;
  readonly type?: DataType;
  readonly top?: boolean;
  readonly children: unknown;
};

type Theme = {
  spacing(n: number): string;
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

function isNonDateObject(value: unknown): value is object {
  return isObject(value) && !isDate(value);
}

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
