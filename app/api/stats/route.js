import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days

    const daysAgo = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Get all habits with logs in date range
    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        logs: {
          where: {
            completedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            completedAt: 'asc',
          },
        },
        _count: {
          select: { logs: true },
        },
      },
    });

    // Calculate overall stats
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => !h.isArchived).length;
    const totalCompletions = habits.reduce((sum, h) => sum + h.logs.length, 0);
    
    // Calculate completion rate
    const totalPossibleCompletions = totalHabits * daysAgo;
    const overallCompletionRate = totalPossibleCompletions > 0
      ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
      : 0;

    // Daily completion data for chart
    const dailyData = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      
      const completionsForDay = habits.reduce((sum, habit) => {
        return sum + habit.logs.filter(l => {
          const lDate = new Date(l.completedAt);
          return lDate.toISOString().split('T')[0] === dateStr;
        }).length;
      }, 0);

      dailyData.push({
        date: dateStr,
        completed: completionsForDay,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((completionsForDay / totalHabits) * 100) : 0,
      });
    }

    // Category breakdown
    const categoryStats = {};
    habits.forEach(habit => {
      if (!categoryStats[habit.category]) {
        categoryStats[habit.category] = {
          count: 0,
          completions: 0,
          color: habit.color,
        };
      }
      categoryStats[habit.category].count++;
      categoryStats[habit.category].completions += habit.logs.length;
    });

    // Streak data
    const streakData = habits.map(habit => {
      const sortedLogs = [...habit.logs].sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      );
      
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].completedAt);
        logDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (logDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
        } else if (i === 0 && logDate < today) {
          break;
        } else {
          break;
        }
      }

      return {
        id: habit.id,
        title: habit.title,
        streak: currentStreak,
        totalCompletions: habit.logs.length,
        color: habit.color,
      };
    }).sort((a, b) => b.streak - a.streak);

    // Weekly comparison
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);

    const thisWeekCompletions = habits.reduce((sum, h) => 
      sum + h.logs.filter(l => new Date(l.completedAt) >= thisWeekStart).length, 0
    );
    
    const lastWeekCompletions = habits.reduce((sum, h) => 
      sum + h.logs.filter(l => {
        const date = new Date(l.completedAt);
        return date >= lastWeekStart && date < thisWeekStart;
      }).length, 0
    );

    const weeklyGrowth = lastWeekCompletions > 0
      ? Math.round(((thisWeekCompletions - lastWeekCompletions) / lastWeekCompletions) * 100)
      : 0;

    return NextResponse.json({
      overview: {
        totalHabits,
        activeHabits,
        totalCompletions,
        overallCompletionRate,
        weeklyGrowth,
        currentStreak: streakData[0]?.streak || 0,
        bestStreak: Math.max(...streakData.map(s => s.streak), 0),
      },
      dailyData,
      categoryStats: Object.entries(categoryStats).map(([name, data]) => ({
        name,
        ...data,
      })),
      streakData,
      habits: habits.map(h => ({
        id: h.id,
        title: h.title,
        category: h.category,
        color: h.color,
        completions: h.logs.length,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', message: error.message },
      { status: 500 }
    );
  }
}