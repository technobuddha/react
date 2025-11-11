import type React from 'react';

export type MenuParams<T> = {
  event: React.MouseEvent<HTMLElement>;
  data?: T[];
  datum?: T;
  index?: number;
};
export type MenuFactory<T> = (args: MenuParams<T>) => void;
