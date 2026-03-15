"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut, getUser } from "@/lib/supabase/auth";
import {
  scheduleDailyCheckIn,
  requestPermissions,
  cancelAll,
} from "@/lib/utils/notifications";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const user = await getUser();
      setEmail(user?.email ?? null);

      // Load saved reminder settings from localStorage
      if (typeof window !== "undefined") {
        const h = localStorage.getItem("pg_reminder_hour");
        const m = localStorage.getItem("pg_reminder_minute");
        if (h) setReminderHour(Number(h));
        if (m) setReminderMinute(Number(m));
        setNotificationsEnabled(localStorage.getItem("pg_notifications") === "true");
      }
    }

    init();
  }, [router]);

  async function handleSaveReminder() {
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_reminder_hour", String(reminderHour));
      localStorage.setItem("pg_reminder_minute", String(reminderMinute));
    }

    if (notificationsEnabled) {
      const granted = await requestPermissions();
      if (granted) {
        await cancelAll();
        await scheduleDailyCheckIn(reminderHour, reminderMinute);
        if (typeof window !== "undefined") {
          localStorage.setItem("pg_notifications", "true");
        }
      }
    } else {
      await cancelAll();
      if (typeof window !== "undefined") {
        localStorage.setItem("pg_notifications", "false");
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[var(--text-muted)]"
            aria-label="Back"
          >
            &#8592;
          </button>
          <h1 className="text-xl font-serif font-semibold">Settings</h1>
        </div>

        {/* Account */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3">
            Account
          </h2>
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Email</span>
              <span className="text-sm text-[var(--text-muted)]">
                {email ?? "Not signed in"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-2 border border-status-missed/30 rounded-lg text-sm text-status-missed"
            >
              Sign out
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3">
            Notifications
          </h2>
          <div className="bg-white rounded-xl p-4 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">Daily check-in reminder</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 rounded accent-garden-green"
              />
            </label>

            {notificationsEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-muted)]">Time:</span>
                <select
                  value={reminderHour}
                  onChange={(e) => setReminderHour(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-200 rounded text-sm"
                  aria-label="Reminder hour"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={reminderMinute}
                  onChange={(e) => setReminderMinute(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-200 rounded text-sm"
                  aria-label="Reminder minute"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSaveReminder}
              className="w-full py-2 bg-garden-green text-white rounded-lg text-sm font-medium"
            >
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </section>

        {/* Stubs */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3">
            Data
          </h2>
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Export data</span>
              <span className="text-xs text-[var(--text-muted)] bg-gray-100 px-2 py-0.5 rounded">
                Coming soon
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Share garden</span>
              <span className="text-xs text-[var(--text-muted)] bg-gray-100 px-2 py-0.5 rounded">
                Coming soon
              </span>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3">
            About
          </h2>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-[var(--text-muted)]">
              Promise Garden v1.0.0
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              by Promise Pipeline
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
