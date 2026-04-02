export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/habits
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where = {
      userId: user.id,
    };

    if (status === 'archived') where.isArchived = true;
    if (status === 'active') where.isArchived = false;
    if (category) where.category = category;

    const habits = await prisma.habit.findMany({
      where,
      include: {
        logs: {
          where: {
            completedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { completedAt: 'desc' },
        },
        reminders: true, // ✅ added
        _count: { select: { logs: true } },
      },
      orderBy: [{ isArchived: 'asc' }, { createdAt: 'desc' }],
    });

    const habitsWithStats = habits.map(habit => {
      const logs = habit.logs || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = 0;
      const sortedLogs = [...logs].sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
      );

      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].completedAt);
        logDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (logDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else break;
      }

      return {
        ...habit,
        currentStreak,
        totalLogs: habit._count?.logs || 0,
      };
    });

    return NextResponse.json({ habits: habitsWithStats });
  } catch (error) {
    console.error('GET /api/habits error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/habits
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const body = await request.json();

    const {
      title,
      description,
      category,
      frequency,
      color,
      icon,
      targetDays,
      reminderEnabled,
      reminderTime,
      reminderMethod,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: category || 'General',
        frequency: frequency || 'daily',
        color: color || '#6366f1',
        icon: icon || '⭐',
        targetDays: targetDays || 7,
        userId: user.id,
      },
    });

    // ✅ CREATE REMINDER
    if (reminderEnabled && reminderTime) {
      await prisma.reminder.create({
        data: {
          time: reminderTime,
          method: reminderMethod || 'push',
          isActive: true,
          habitId: habit.id,
        },
      });
    }

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('POST /api/habits error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create habit',
        message: error.message,
      },
      { status: 500 }
    );
  }
}