import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);

   const params = await context.params;
const id = params?.id;      

    if (!id) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      title,
      description,
      category,
      frequency,
      color,
      targetDays,
      isArchived,
      reminderTime,
      reminderMethod,
      reminderEnabled,
    } = body;

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        reminders: true,
      },
    });

    if (!existingHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (category !== undefined) updateData.category = category;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (color !== undefined) updateData.color = color;
    if (targetDays !== undefined) updateData.targetDays = Number(targetDays);
    if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: updateData,
      include: {
        reminders: true,
      },
    });

    const existingReminder = existingHabit.reminders?.[0] || null;

    if (reminderEnabled && reminderTime) {
      if (existingReminder) {
        await prisma.reminder.update({
          where: { id: existingReminder.id },
          data: {
            time: reminderTime,
            method: reminderMethod || existingReminder.method || "push",
            isActive: true,
          },
        });
      } else {
        await prisma.reminder.create({
          data: {
            time: reminderTime,
            method: reminderMethod || "push",
            isActive: true,
            habitId: id,
          },
        });
      }
    } else if (existingReminder) {
      await prisma.reminder.update({
        where: { id: existingReminder.id },
        data: {
          isActive: false,
        },
      });
    }

    const finalHabit = await prisma.habit.findUnique({
      where: { id },
      include: {
        reminders: true,
      },
    });

    return NextResponse.json({ habit: finalHabit || updatedHabit });

  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update habit" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}