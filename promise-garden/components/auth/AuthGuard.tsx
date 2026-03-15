"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, onAuthStateChange } from "@/lib/supabase/auth";
import type { Session } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((s) => {
      setSession(s);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-garden-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    if (fallback) return <>{fallback}</>;
    router.push("/auth/login");
    return null;
  }

  return <>{children}</>;
}
