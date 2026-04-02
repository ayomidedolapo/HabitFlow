export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET single habit
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
   const { id } = params; 

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
    console.error("Error fetching habit:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit" },
      { status: 500 }
    );
  }
}

// PATCH habit (archive + unarchive works here)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.color !== undefined) updateData.color = body.color;

    // ✅ THIS is what archive/unarchive uses
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
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

// DELETE habit
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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

    // delete logs first
    await prisma.habitLog.deleteMany({
      where: { habitId: id },
    });

    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}