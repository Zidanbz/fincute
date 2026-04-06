"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from "recharts";
import { Transaction } from "@prisma/client";
import { format } from "date-fns";

type Tx = Transaction & { category: { name: string; type: string } | null };

export function OverviewChart({ transactions }: { transactions: Tx[] }) {
  const grouped = transactions.reduce<Record<string, { income: number; expense: number }>>(
    (acc, tx) => {
      const key = format(tx.date, "MMM d");
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      if (tx.type === "INCOME") acc[key].income += Number(tx.amount);
      else acc[key].expense += Number(tx.amount);
      return acc;
    },
    {}
  );

  const data = Object.entries(grouped).map(([name, val]) => ({
    name,
    income: val.income,
    expense: val.expense,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={12}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <Tooltip />
          <Bar dataKey="income" stackId="a" fill="#B7F0D8" radius={[12, 12, 0, 0]} />
          <Bar dataKey="expense" stackId="a" fill="#FFC8DD" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

