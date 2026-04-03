export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// =======================
// GET single habit
// =======================
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ FIX HERE
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        logs: {
          orderBy: {
            completedAt: "desc",
          },
        },
        reminders: true, // 🔥 needed for edit page
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error("GET habit error:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

// =======================
// PATCH habit
// =======================
export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);

    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updateData = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.color !== undefined) updateData.color = body.color;

    if (body.isArchived !== undefined) {
      updateData.isArchived = body.isArchived;
    }

    if (body.targetDays !== undefined) {
      updateData.targetDays = Number(body.targetDays);
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ habit: updatedHabit });
  } catch (error) {
    console.error("PATCH habit error:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

// =======================
// DELETE habit
// =======================
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);

    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await prisma.habitLog.deleteMany({
      where: { habitId: id },
    });

    await prisma.reminder.deleteMany({
      where: { habitId: id },
    });

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("DELETE habit error:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}