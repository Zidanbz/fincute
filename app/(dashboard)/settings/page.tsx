import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Profile basics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-600">Email: {user?.email}</p>
        <p className="text-sm text-slate-600">Name: {user?.name ?? "—"}</p>
        <p className="text-xs text-slate-500">
          More settings (notifications, billing) can be added here.
        </p>
      </CardContent>
    </Card>
  );
}
