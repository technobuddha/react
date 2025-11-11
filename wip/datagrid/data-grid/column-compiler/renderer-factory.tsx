import React from 'react';
import { toDate } from '@technobuddha/library';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { isNumber, toString } from '@technobuddha/library';
import { Anything } from '../../anything';

import type { Shape } from '../analyzer';
import type { ColumnSpecification, ColumnType, ColumnRenderProps } from '../column';

const useCellStyles = makeStyles(() => ({
  cell: {
    flexGrow: 1,
    //margin: theme.spacing(0.5),
  },
  left: {
    textAlign: 'left',
  },
  right: {
    textAlign: 'right',
  },
}));

export function rendererFactory<T = unknown>(
  column: ColumnSpecification<T>,
  type: ColumnType,
  shape: Shape,
): ({ datum }: ColumnRenderProps<T>) => React.ReactElement {
  if (column.render) return column.render;

  switch (shape) {
    case 'key-value': {
      const key = column.name.toString();

      return ({ datum }: ColumnRenderProps<T>) => {
        const css = useCellStyles();
        const field = (datum as Record<string, any>)[key];
        return (
          <Anything className={css.cell} type={type.dataType}>
            {field}
          </Anything>
        );
      };
    }

    case 'array': {
      const key = isNumber(column.name) ? column.name : Number.parseFloat(column.name);

      switch (type.dataType) {
        case 'number':
        case 'boolean':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            const field = (datum as unknown as unknown[])[key];
            return <Box className={clsx(css.cell, css.right)}>{toString(field)}</Box>;
          };

        case 'date':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            const field = (datum as unknown as unknown[])[key];
            return <Box className={clsx(css.cell, css.left)}>{toDate(field).toUTCString()}</Box>;
          };

        case 'object':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            const field = (datum as unknown as any[])[key];
            return (
              <Box className={clsx(css.cell, css.left)}>
                <Anything>{field}</Anything>
              </Box>
            );
          };

        case 'array':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            const field = (datum as unknown as any[])[key] as unknown[];
            return (
              <Box className={clsx(css.cell, css.left)}>
                <Anything>{field}</Anything>
              </Box>
            );
          };

        case 'unknown':
        case 'string':
        default:
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            const field = (datum as unknown as unknown[])[key];
            return <Box className={clsx(css.cell, css.left)}>{toString(field)}</Box>;
          };
      }
    }

    case 'primitive':
    case 'polymorphic': {
      switch (type.dataType) {
        case 'number':
        case 'boolean':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            return <Box className={clsx(css.cell, css.right)}>{toString(datum)}</Box>;
          };

        case 'date':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            return <Box className={clsx(css.cell, css.left)}>{toDate(datum).toUTCString()}</Box>;
          };

        case 'object':
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            return (
              <Box className={clsx(css.cell, css.left)}>
                <Anything>{datum}</Anything>
              </Box>
            );
          };

        case 'array':
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return () => <></>;

        case 'unknown':
        case 'string':
        default:
          return ({ datum }: ColumnRenderProps<T>) => {
            const css = useCellStyles();
            return <Box className={clsx(css.cell, css.left)}>{toString(datum)}</Box>;
          };
      }
    }

    default:
      return ({ datum }: ColumnRenderProps<T>) => {
        const css = useCellStyles();
        return <Box className={clsx(css.cell, css.left)}>{toString(datum)}</Box>;
      };
  }
}

export default rendererFactory;
