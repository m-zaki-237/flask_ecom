import { useState, useEffect } from "react";

let listeners = [];
let memoryState = [];

function emitChange() {
  listeners.forEach((listener) => listener(memoryState));
}

export function toast({ title, description, variant = "default", duration = 3000 }) {
  const id = Math.random().toString(36).substring(2, 9);
  const toastItem = { id, title, description, variant, duration };
  memoryState = [...memoryState, toastItem];
  emitChange();

  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== id);
    emitChange();
  }, duration);
}

export function useToast() {
  const [toasts, setToasts] = useState(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: (id) => {
      memoryState = memoryState.filter((t) => t.id !== id);
      emitChange();
    },
  };
}
