import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Habit from "@/models/Habit";
import ActivityLog from "@/models/ActivityLog";
import { startOfWeek, addDays, startOfDay, isSameDay } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Fetch habits for this user
    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    // Since streak calculation is complex, we will compute streaks per habit.
    // Fetch all logs for this user to calculate streaks.
    const allLogs = await ActivityLog.find({ userId, isCompleted: true }).sort({ date: 1 });

    const habitsWithData = habits.map((habit) => {
      // Find logs particular to this habit
      const logs = allLogs.filter((log) => log.habitId.toString() === habit._id.toString());
      
      let streak = 0;
      let currentDate = startOfDay(new Date());

      // Simple streak logic: stepping back day by day to count the streak, 
      // skipping non-target days.
      let checkDate = currentDate;
      let keepChecking = true;

      while (keepChecking) {
        const dayOfWeek = checkDate.getDay(); // 0 is Sunday, 6 is Saturday
        
        // If today is not a target day, we just skip it (doesn't break or build streak)
        if (!habit.targetDays.includes(dayOfWeek)) {
          checkDate = addDays(checkDate, -1);
          continue;
        }

        // Check if there is a log for checkDate
        const logExists = logs.some((l) => isSameDay(startOfDay(new Date(l.date)), checkDate));
        
        if (logExists) {
          streak++;
          checkDate = addDays(checkDate, -1);
        } else {
          // If it's a target day and there's no log, the streak is broken
          // Unless it's today (we give the user the end of the day to complete it)
          if (isSameDay(checkDate, currentDate)) {
            checkDate = addDays(checkDate, -1);
          } else {
            keepChecking = false;
          }
        }
      }

      return {
        ...habit.toObject(),
        streak, // our computed streak
        logs: logs.map(l => l.date), // return log dates so frontend can build heatmap
      };
    });

    return NextResponse.json({ habits: habitsWithData }, { status: 200 });
  } catch (error) {
    console.error("Habits GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, themeColor, icon, targetDays, subtasks } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await dbConnect();

    const habit = await Habit.create({
      userId: session.user.id,
      title,
      themeColor: themeColor || "#facc15",
      icon: icon || "Dumbbell",
      targetDays: targetDays || [0, 1, 2, 3, 4, 5, 6],
      subtasks: subtasks || [],
    });

    return NextResponse.json({ message: "Habit created", habit }, { status: 201 });
  } catch (error) {
    console.error("Habits POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
