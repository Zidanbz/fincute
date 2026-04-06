"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Circle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    setLoading(false);
    if (!res?.error) {
      router.push(callbackUrl);
    } else {
      alert("Login failed, please check your credentials");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCredentials} className="space-y-3">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <Circle className="h-4 w-4 text-cute-blue" />
        Continue with Google
      </Button>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <a href="/register" className="font-semibold text-cute-purple hover:underline">
          Create one
        </a>
      </p>
    </div>
  );
}
