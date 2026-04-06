import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, PiggyBank, Wallet, FileBarChart, Home, Layers } from "lucide-react";
import "./dashboard.css";

export const runtime = "nodejs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: Layers },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/debts", label: "Debts", icon: FileBarChart },
  { href: "/invoices", label: "Invoices", icon: FileBarChart },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: FileBarChart },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cute-pink/30 via-white to-cute-blue/30">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
        <aside className="hidden w-60 shrink-0 rounded-3xl bg-white/80 p-4 shadow-soft backdrop-blur-lg md:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cute-purple text-sm font-bold text-slate-900">
              FC
            </div>
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <p className="text-base font-semibold text-slate-900">
                {session.user.name ?? session.user.email}
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = false; // handled client-side per page if needed
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100",
                    isActive && "bg-slate-100 text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action="/api/auth/signout" method="post" className="mt-6">
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </aside>
        <main className="flex-1">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">FinCute</p>
              <h1 className="text-2xl font-semibold text-slate-900">Your cute finance OS</h1>
            </div>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
