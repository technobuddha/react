import type React from 'react';

/**
 * Parameters passed to menu factory functions.
 *
 * Contains information about the mouse event and the data context
 * where the menu was triggered (entire dataset, specific row, or header).
 *
 * @typeParam T - The type of data items in the grid
 * @group Components
 * @category DataGrid
 */
export type MenuParams<T> = {
  /** The mouse event that triggered the menu */
  event: React.MouseEvent<HTMLElement>;
  /** The complete dataset (available for all menu contexts) */
  data?: T[];
  /** The specific data item for the row (only available for row menus) */
  datum?: T;
  /** The index of the row (only available for row menus) */
  index?: number;
};

/**
 * Function type for creating context menus.
 *
 * A factory function that receives menu parameters and is responsible for
 * displaying a context menu. The implementation typically uses the event
 * to position the menu and the data context to populate menu items.
 *
 * @typeParam T - The type of data items in the grid
 *
 * @example
 * ```typescript
 * const menuFactory: MenuFactory\<User\> = ({ event, datum, index }) => {
 *   event.preventDefault();
 *   // Show context menu at event position
 *   showMenu({
 *     x: event.clientX,
 *     y: event.clientY,
 *     items: [
 *       { label: `Edit ${datum?.name}`, onClick: () => editUser(datum) },
 *       { label: `Delete ${datum?.name}`, onClick: () => deleteUser(datum) },
 *     ],
 *   });
 * };
 * ```
 *
 * @group Components
 * @category DataGrid
 */
export type MenuFactory<T> = (args: MenuParams<T>) => void;
