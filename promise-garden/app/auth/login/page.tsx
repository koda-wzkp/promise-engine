"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession } from "@/lib/supabase/auth";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then((s) => {
      if (s) router.push("/");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-serif font-semibold mb-1">
          Promise Garden
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          by Promise Pipeline
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
