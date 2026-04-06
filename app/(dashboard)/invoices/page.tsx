import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import { InvoiceForm } from "@/app/components/forms/invoice-form";
import { ItemActions } from "@/app/components/item-actions";

export const runtime = "nodejs";

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const incomeCategories = await prisma.category.findMany({
    where: { userId: session.user.id, type: "INCOME" },
  });
  const accounts = await prisma.walletAccount.findMany({ where: { userId: session.user.id } });
  const accountOptions = accounts.map((a) => ({ id: a.id, name: a.name }));
  const categoryOptions = incomeCategories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Send, track, and log income</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{inv.client}</p>
                <p className="text-xs text-slate-500">Due {inv.dueDate?.toDateString() ?? "—"}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatIDR(Number(inv.amount))}
                  </p>
                  <Badge tone={inv.status === "PAID" ? "success" : "warning"}>{inv.status}</Badge>
                </div>
                <ItemActions
                  kind="invoice"
                  payload={{ id: inv.id, status: inv.status }}
                  endpoint="/api/invoices"
                />
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-sm text-slate-600">No invoices yet. Create one to bill a client.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add invoice</CardTitle>
          <CardDescription>Auto-log income when paid</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceForm accounts={accountOptions} incomeCategories={categoryOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
