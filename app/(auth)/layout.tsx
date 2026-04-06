import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinCute | Login",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cute-blue/40 via-white to-cute-pink/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">FinCute</p>
          <h1 className="text-2xl font-semibold text-slate-900">Friendly finance OS</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

