import React from 'react';
import { type Diff, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from '@technobuddha/library';

export type DifferenceProps = { readonly diffs: Diff[]; readonly children?: never };

export const Difference: React.FC<DifferenceProps> = ({ diffs }) => (
  <div>
    {diffs.map((diff) => {
      switch (diff.op) {
        case DIFF_EQUAL: {
          return <span key={Math.random()}>{diff.text}</span>;
        }

        case DIFF_INSERT: {
          return (
            <ins key={Math.random()} style={{ backgroundColor: '#e6ffe6', textDecoration: 'none' }}>
              {diff.text}
            </ins>
          );
        }

        case DIFF_DELETE: {
          return (
            <del key={Math.random()} style={{ backgroundColor: '#ffe6e6' }}>
              {diff.text}
            </del>
          );
        }

        default: {
          return null;
        }
      }
    })}
  </div>
);
