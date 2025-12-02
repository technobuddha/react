/* eslint-disable react/no-multi-comp */
import React from 'react';
import { makeStyles } from '@mui/styles';
import { isString } from '@technobuddha/library';

import { type AnalyzerResults } from '../analyzer.ts';
import {
  type Column,
  type ColumnHeaderProps,
  type ColumnRenderProps,
  type ColumnSpecifications,
} from '../column.ts';
import { MasterSelectionIndicator, RowSelectionIndicator } from '../selection-indictors.tsx';

import { collatorFactory, nullCollator } from './collator-factory.ts';
import { headerFactory } from './header-factory.tsx';
import { rendererFactory } from './renderer-factory.tsx';

const useStyles = makeStyles((theme) => ({
  checkbox: {
    color: theme.palette.primary.contrastText,
  },
}));

function Header<T = unknown>({ data }: ColumnHeaderProps<T>): React.ReactElement {
  const css = useStyles();

  return <MasterSelectionIndicator data={data} className={css.checkbox} />;
}

function Render<T = unknown>({ datum }: ColumnRenderProps<T>): React.ReactElement {
  return <RowSelectionIndicator datum={datum} />;
}

export function columnCompiler<T = unknown>(
  { getKeys, getColumnType, getShape, createDefaultColumn }: AnalyzerResults<T>,
  selection: boolean,
  controlWidth: number,
  columns?: ColumnSpecifications<T>,
): Column<T>[] {
  const cols =
    columns ?
      columns.map((column) => {
        if (isString(column)) {
          return createDefaultColumn(column);
        }

        const columnName = column.name.toString();
        const shape = getShape();
        const type = getColumnType(columnName);

        return {
          name: columnName,
          width: column.width ?? '*',
          header: headerFactory(column, type, shape),
          render: rendererFactory(column, type, shape),
          sortBy: column.sortBy === null ? null : (column.sortBy ?? [column.name]),
          collate: collatorFactory(column, type, shape),
        } as Column<T>;
      })
    : getKeys().map((key) => createDefaultColumn(key));

  if (selection) {
    cols.unshift({
      name: '[selection]',
      width: controlWidth,
      header: Header,
      render: Render,
      sortBy: null,
      collate: nullCollator,
    });
  }

  return cols;
}
