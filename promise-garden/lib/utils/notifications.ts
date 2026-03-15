// Local notification scheduling via Capacitor.
// Falls back to no-op on web (notifications are web-only reminders there).

interface NotificationSchedule {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

let LocalNotifications: typeof import("@capacitor/local-notifications").LocalNotifications | null = null;

async function getPlugin() {
  if (LocalNotifications) return LocalNotifications;
  try {
    const mod = await import("@capacitor/local-notifications");
    LocalNotifications = mod.LocalNotifications;
    return LocalNotifications;
  } catch {
    return null;
  }
}

export async function requestPermissions(): Promise<boolean> {
  const plugin = await getPlugin();
  if (!plugin) return false;
  const result = await plugin.requestPermissions();
  return result.display === "granted";
}

export async function scheduleDailyCheckIn(hour: number, minute: number): Promise<void> {
  const plugin = await getPlugin();
  if (!plugin) return;

  await plugin.schedule({
    notifications: [
      {
        id: 1,
        title: "Promise Garden",
        body: "Time to check in on your promises.",
        schedule: {
          on: { hour, minute },
          repeats: true,
        },
      },
    ],
  });
}

export async function scheduleWeeklySummary(
  dayOfWeek: number,
  hour: number,
  minute: number
): Promise<void> {
  const plugin = await getPlugin();
  if (!plugin) return;

  await plugin.schedule({
    notifications: [
      {
        id: 2,
        title: "Promise Garden",
        body: "Your weekly garden summary is ready.",
        schedule: {
          on: { weekday: dayOfWeek + 1, hour, minute }, // Capacitor weekday is 1-indexed (1=Sun)
          repeats: true,
        },
      },
    ],
  });
}

export async function scheduleMonthlySummary(
  hour: number,
  minute: number
): Promise<void> {
  const plugin = await getPlugin();
  if (!plugin) return;

  // Schedule for last day of current month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  await plugin.schedule({
    notifications: [
      {
        id: 3,
        title: "Promise Garden",
        body: "Your monthly garden review is ready.",
        schedule: {
          on: { day: lastDay, hour, minute },
          repeats: true,
        },
      },
    ],
  });
}

export async function cancelAll(): Promise<void> {
  const plugin = await getPlugin();
  if (!plugin) return;
  const pending = await plugin.getPending();
  if (pending.notifications.length > 0) {
    await plugin.cancel({ notifications: pending.notifications });
  }
}
