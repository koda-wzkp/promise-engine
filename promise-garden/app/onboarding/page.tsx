"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase/auth";
import { createPromise, saveGardenState } from "@/lib/supabase/queries";
import { createPlantState } from "@/lib/garden/lifecycle";
import { computePlantPosition } from "@/lib/garden/layout";
import type { PersonalDomain, CheckInFrequency } from "@/lib/types/personal";
import type { PlantState, GardenState } from "@/lib/types/garden";
import PromiseForm from "@/components/creation/PromiseForm";
import AuthForm from "@/components/auth/AuthForm";
import { scheduleDailyCheckIn } from "@/lib/utils/notifications";

type OnboardingStep =
  | "clearcut"
  | "first_promise"
  | "two_more"
  | "dependencies"
  | "check_in_preview"
  | "set_reminder"
  | "auth"
  | "release";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("clearcut");
  const [plants, setPlants] = useState<PlantState[]>([]);
  const [pendingPromises, setPendingPromises] = useState<
    Array<{
      body: string;
      domain: PersonalDomain;
      durationTier: string;
      stakesTier: string;
      checkInFrequency: CheckInFrequency;
    }>
  >([]);
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);

  const handleFirstPromise = useCallback(
    (data: {
      body: string;
      domain: PersonalDomain;
      durationTier: string;
      stakesTier: string;
      checkInFrequency: CheckInFrequency;
    }) => {
      const tempId = `temp-${Date.now()}`;
      const position = computePlantPosition(tempId, data.domain, plants);
      const plant = createPlantState(
        tempId,
        data.domain,
        data.durationTier as "short" | "medium" | "long",
        data.stakesTier as "low" | "medium" | "high",
        position
      );
      setPlants((prev) => [...prev, plant]);
      setPendingPromises((prev) => [...prev, data]);
      setStep("two_more");
    },
    [plants]
  );

  const handleAdditionalPromise = useCallback(
    (data: {
      body: string;
      domain: PersonalDomain;
      durationTier: string;
      stakesTier: string;
      checkInFrequency: CheckInFrequency;
    }) => {
      const tempId = `temp-${Date.now()}`;
      const position = computePlantPosition(tempId, data.domain, plants);
      const plant = createPlantState(
        tempId,
        data.domain,
        data.durationTier as "short" | "medium" | "long",
        data.stakesTier as "low" | "medium" | "high",
        position
      );
      setPlants((prev) => [...prev, plant]);
      setPendingPromises((prev) => [...prev, data]);

      if (pendingPromises.length >= 2) {
        setStep("dependencies");
      }
    },
    [plants, pendingPromises.length]
  );

  async function handleAuthComplete() {
    const session = await getSession();
    if (session) {
      // Save the onboarding promises to the database
      const userId = session.user.id;
      const newPlants: PlantState[] = [];

      for (const data of pendingPromises) {
        const promise = await createPromise(userId, data);
        const position = computePlantPosition(promise.id, data.domain, newPlants);
        const plant = createPlantState(
          promise.id,
          data.domain,
          data.durationTier as "short" | "medium" | "long",
          data.stakesTier as "low" | "medium" | "high",
          position
        );
        newPlants.push(plant);
      }

      // Save garden state
      const gardenState: GardenState = {
        userId,
        plants: newPlants,
        wildlife: [],
        landscape: {
          currentMilestones: ["clearing"],
          overallReliability: 0,
          skyState: "stormy",
          hasStream: false,
          streamFlow: 0,
        },
        lastComputedAt: new Date().toISOString(),
      };
      await saveGardenState(gardenState);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("pg_onboarded", "true");
    }
    setStep("release");
  }

  function handleSkipAuth() {
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_onboarded", "true");
      localStorage.setItem(
        "pg_pending_promises",
        JSON.stringify(pendingPromises)
      );
    }
    setStep("release");
  }

  // ─── SCREENS ───

  if (step === "clearcut") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-100">
        <div className="text-center">
          <p className="text-2xl font-serif font-semibold text-gray-600 mb-8">
            Every forest starts somewhere.
          </p>
          <button
            onClick={() => setStep("first_promise")}
            className="px-8 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (step === "first_promise") {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-8">
        <div className="text-center mb-4 px-6">
          <p className="text-lg font-serif">
            Let&apos;s plant something.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            What&apos;s one thing you want to commit to?
          </p>
        </div>
        <PromiseForm
          onSubmit={handleFirstPromise}
          simplified
        />
      </div>
    );
  }

  if (step === "two_more") {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-8">
        <div className="text-center mb-4 px-6">
          <p className="text-lg font-serif">
            A forest needs variety.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Pick {3 - pendingPromises.length} more domain{3 - pendingPromises.length > 1 ? "s" : ""} to plant in.
          </p>
          <div className="flex justify-center gap-2 mt-2">
            {pendingPromises.map((p, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-garden-green/10 text-garden-green rounded-full"
              >
                {p.domain}
              </span>
            ))}
          </div>
        </div>
        <PromiseForm
          onSubmit={handleAdditionalPromise}
          simplified
        />
      </div>
    );
  }

  if (step === "dependencies") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bg)]">
        <div className="max-w-sm text-center">
          <p className="text-lg font-serif mb-3">
            Promises can depend on each other.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            When one struggles, connected promises feel it. You can connect them
            later — the app will suggest connections as it learns your patterns.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-[var(--text-muted)]">
            Example: &ldquo;Exercise 3x/week&rdquo; depends on &ldquo;Sleep by 11pm.&rdquo;
            When you break the sleep promise, the exercise plant shows stress.
          </div>
          <button
            onClick={() => setStep("check_in_preview")}
            className="px-8 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Got it
          </button>
          <button
            onClick={() => setStep("check_in_preview")}
            className="block mx-auto mt-3 text-sm text-[var(--text-muted)]"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  if (step === "check_in_preview") {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-8">
        <div className="text-center mb-4 px-6">
          <p className="text-lg font-serif mb-1">
            Each evening, we&apos;ll ask:
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Did you keep your promises today?
          </p>
        </div>
        <div className="max-w-sm mx-auto">
          {pendingPromises.map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <p className="text-sm font-medium mb-3">{p.body}</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (i === pendingPromises.length - 1) {
                      setStep("set_reminder");
                    }
                  }}
                  className="py-2 rounded-lg bg-status-keptBg text-status-kept text-xs font-medium"
                >
                  Kept
                </button>
                <button className="py-2 rounded-lg bg-status-partialBg text-status-partial text-xs font-medium">
                  Partially
                </button>
                <button className="py-2 rounded-lg bg-status-missedBg text-status-missed text-xs font-medium">
                  Missed
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setStep("set_reminder")}
            className="w-full mt-4 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === "set_reminder") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bg)]">
        <div className="max-w-sm text-center">
          <p className="text-lg font-serif mb-2">
            When should we remind you to check in?
          </p>
          <div className="flex items-center justify-center gap-2 my-6">
            <select
              value={reminderHour}
              onChange={(e) => setReminderHour(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-lg"
              aria-label="Hour"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-lg">:</span>
            <select
              value={reminderMinute}
              onChange={(e) => setReminderMinute(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-lg"
              aria-label="Minute"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={async () => {
              await scheduleDailyCheckIn(reminderHour, reminderMinute);
              setStep("auth");
            }}
            className="px-8 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Set reminder
          </button>
        </div>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bg)]">
        <AuthForm onSkip={handleSkipAuth} showSkip />
      </div>
    );
  }

  if (step === "release") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-100">
        <div className="text-center">
          <p className="text-2xl font-serif font-semibold text-gray-600 mb-4">
            Check in tonight.
          </p>
          <p className="text-2xl font-serif font-semibold text-garden-green mb-8">
            Watch what grows.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-garden-green text-white rounded-xl text-sm font-medium"
          >
            Enter your garden
          </button>
        </div>
      </div>
    );
  }

  return null;
}
