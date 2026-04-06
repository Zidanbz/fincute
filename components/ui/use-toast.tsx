import * as React from "react";

type Toast = { id: number; message: string };

const ToastContext = React.createContext<{
  toasts: Toast[];
  push: (message: string) => void;
}>({ toasts: [], push: () => {} });

let id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = (message: string) => {
    const next = { id: ++id, message };
    setToasts((t) => [...t, next]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== next.id)), 3000);
  };
  return <ToastContext.Provider value={{ toasts, push }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return React.useContext(ToastContext);
}

