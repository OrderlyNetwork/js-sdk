export type RouteOption = {
  href: string;
  name: string;
  scope?: string;
  target?: string;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
};

export type RouterAdapter = {
  onRouteChange: (option: RouteOption) => void;
  currentPath?: string;
};
