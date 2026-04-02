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

export async function GET() {
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

    const { start, end } = getTodayRange();

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: {
          userId: user.id,
        },
        completedAt: {
          gte: start,
          lte: end,
        },
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
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("GET /api/habits/logs/today error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch today's logs" },
      { status: 500 }
    );
  }
}