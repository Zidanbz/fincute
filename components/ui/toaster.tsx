"use client";

import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

