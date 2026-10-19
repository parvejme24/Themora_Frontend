import { useSyncExternalStore } from "react";

// Open/closed state of the cart drawer, shared by the navbar button,
// "Add to cart" buttons and the drawer itself
let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const cartDrawer = {
  open() {
    open = true;
    emit();
  },
  close() {
    open = false;
    emit();
  },
  set(value: boolean) {
    open = value;
    emit();
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useCartDrawerOpen = () =>
  useSyncExternalStore(subscribe, () => open, () => false);
