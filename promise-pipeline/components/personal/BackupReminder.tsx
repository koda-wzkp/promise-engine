"use client";

import { useState, useEffect } from "react";
import {
  getBackupReminderState,
  dismissBackupReminder,
  downloadPersonalBackup,
  BackupReminderState,
} from "@/lib/personal/backup";

export default function BackupReminder() {
  const [state, setState] = useState<BackupReminderState | null>(null);

  useEffect(() => {
    setState(getBackupReminderState());
  }, []);

  if (!state?.show) return null;

  const handleDownload = () => {
    downloadPersonalBackup();
    setState({ ...state, show: false });
  };

  const handleDismiss = () => {
    dismissBackupReminder();
    setState({ ...state, show: false });
  };

  const lastBackupFormatted = state.lastBackupDate
    ? new Date(state.lastBackupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-6 rounded-lg border-l-[3px] border-l-[#1e40af] bg-[#eff6ff] p-4"
    >
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-[#1e40af]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>

        <div className="min-w-0 flex-1">
          {state.variant === "first-time" ? (
            <>
              <p className="text-sm font-medium text-[#1f2937]">
                Your promises live in this browser&apos;s storage.
              </p>
              <p className="mt-1 text-sm text-[#1f2937]">
                If you clear your browsing data or switch devices, they&apos;re gone. Download a backup to keep them safe.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[#1f2937]">
                You have new promises since your last backup{lastBackupFormatted ? ` (${lastBackupFormatted})` : ""}.
              </p>
              <p className="mt-1 text-sm text-[#1f2937]">
                Download an updated backup to keep your data safe.
              </p>
            </>
          )}

          {state.isSafariIOS && state.variant === "first-time" && (
            <p className="mt-1 text-sm font-medium text-amber-700">
              Safari may delete your data if you don&apos;t visit for 7 days.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              className="rounded bg-[#1e40af] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2 transition-colors"
            >
              Download backup
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss backup reminder"
              className="text-sm text-[#4b5563] hover:text-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2 rounded px-1 transition-colors"
            >
              {state.variant === "first-time" ? "Remind me later" : "Dismiss"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
