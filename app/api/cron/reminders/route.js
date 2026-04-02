export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import admin from "@/lib/firebase-admin";

export async function GET() {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const reminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        time: currentTime,
      },
      include: {
        habit: {
          include: {
            user: true,
          },
        },
      },
    });

    for (const reminder of reminders) {
      const token = reminder.habit.user.pushToken;

      if (!token) continue;

      await admin.messaging().send({
        token,
        data: {
          title: "🔥 Habit Reminder",
          body: `💪 ${reminder.habit.title}`,
        },
      });

      console.log("🔔 Sent:", reminder.habit.title);
    }

    return NextResponse.json({
      success: true,
      count: reminders.length,
    });
  } catch (error) {
    console.error("CRON ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}