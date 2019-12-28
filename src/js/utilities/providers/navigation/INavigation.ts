export interface INavigation {
  registerElementCollection(collection, navOrder): void;
  registerElement(element, navOrder): void;
  remove(element): void;
  focusDialog(dialog): void;
  unfocusDialog(): void;
  clear(): void;
}
