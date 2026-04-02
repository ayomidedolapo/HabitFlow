import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

async function getRouteId(context) {
  const params = await Promise.resolve(context.params);
  return params?.id;
}

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Habit ID is required" },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!habit) {
      return NextResponse.json(
        { success: false, error: "Habit not found" },
        { status: 404 }
      );
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const note = typeof body.note === "string" ? body.note : null;

    const { start, end } = getTodayRange();

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (existingLog) {
      return NextResponse.json(
        {
          success: false,
          error: "Habit already logged for today",
          log: existingLog,
        },
        { status: 409 }
      );
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId: id,
        note,
      },
      include: {
        habit: {
          select: {
            id: true,
            title: true,
            color: true,
            category: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Habit logged successfully for today",
        log,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/habits/[id]/log error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log habit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Habit ID is required" },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!habit) {
      return NextResponse.json(
        { success: false, error: "Habit not found" },
        { status: 404 }
      );
    }

    const { start, end } = getTodayRange();

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { success: false, error: "No log found for today" },
        { status: 404 }
      );
    }

    await prisma.habitLog.delete({
      where: {
        id: existingLog.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Today's habit log removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/habits/[id]/log error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove habit log" },
      { status: 500 }
    );
  }
}