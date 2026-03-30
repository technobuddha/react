import React from 'react';
import {
  type Difference as Diff,
  DIFFERENCE_DELETE,
  DIFFERENCE_EQUAL,
  DIFFERENCE_INSERT,
} from '@technobuddha/library';

/**
 * Props for the Difference component
 *
 * @group Components
 * @category Difference
 */
export type DifferenceProps = {
  /** Array of diff operations to render */
  readonly diffs: Diff[];
  /** Children are not allowed */
  readonly children?: never;
};

/**
 * Component for displaying text differences with color-coded insertions and deletions
 *
 * Renders a visual representation of text differences where:
 * - Insertions are shown in green background (\<ins\>)
 * - Deletions are shown in red background (\<del\>)
 * - Equal text is shown normally (\<span\>)
 *
 * @param props - The component props
 * @returns A div containing the formatted diff output
 *
 * @example
 * ```tsx
 * const diffs = diffText('Hello world', 'Hello React');
 * \<Difference diffs={diffs} /\>
 * ```
 *
 * @group Components
 * @category Difference
 */
export const Difference: React.FC<DifferenceProps> = ({ diffs }) => (
  <div>
    {diffs.map((diff) => {
      switch (diff.op) {
        case DIFFERENCE_EQUAL: {
          return <span key={Math.random()}>{diff.text}</span>;
        }

        case DIFFERENCE_INSERT: {
          return (
            <ins key={Math.random()} style={{ backgroundColor: '#e6ffe6', textDecoration: 'none' }}>
              {diff.text}
            </ins>
          );
        }

        case DIFFERENCE_DELETE: {
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
