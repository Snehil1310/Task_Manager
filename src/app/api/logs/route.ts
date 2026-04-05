import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";
import Habit from "@/models/Habit";
import { startOfDay, isSameDay } from "date-fns";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date, isCompleted, subtaskId, totalDuration } = await request.json();

    if (!habitId || !date) {
      return NextResponse.json({ error: "Habit ID and date are required" }, { status: 400 });
    }

    await dbConnect();
    const userId = session.user.id;
    const normalizedDate = startOfDay(new Date(date));
    const today = startOfDay(new Date());

    if (!isSameDay(normalizedDate, today)) {
       return NextResponse.json({ error: "Cannot modify logs for past or future dates" }, { status: 403 });
    }

    // Fetch the habit to validate and calculate durations
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    let log = await ActivityLog.findOne({ habitId, userId, date: normalizedDate });

    if (!log) {
      // Create new log document if missing
      log = new ActivityLog({
        habitId,
        userId,
        date: normalizedDate,
        isCompleted: false,
        completedSubtasks: [],
        totalDuration: 0,
      });
    }

    if (subtaskId !== undefined) {
      // Toggle subtask
      const subtaskObjId = new mongoose.Types.ObjectId(subtaskId);
      const isSubtaskCompleted = log.completedSubtasks.includes(subtaskObjId);

      if (isSubtaskCompleted) {
        log.completedSubtasks = log.completedSubtasks.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== subtaskId
        );
      } else {
        log.completedSubtasks.push(subtaskObjId);
      }

      // Check if all subtasks are now complete to auto-complete the main habit
      if (habit.subtasks && habit.subtasks.length > 0) {
        if (log.completedSubtasks.length === habit.subtasks.length) {
          log.isCompleted = true;
        } else {
          log.isCompleted = false;
        }
      }
    } else if (isCompleted !== undefined) {
      // Toggle main habit
      log.isCompleted = isCompleted;
      
      // Auto complete subtasks if main habit is checked
      if (log.isCompleted && habit.subtasks && habit.subtasks.length > 0) {
        log.completedSubtasks = habit.subtasks.map((st: any) => st._id);
      } else if (!log.isCompleted) {
        log.completedSubtasks = [];
      }
    }

    // Update total duration based on completed subtasks, or fallback to given totalDuration
    if (totalDuration !== undefined) {
      log.totalDuration = totalDuration;
    } else if (habit.subtasks && habit.subtasks.length > 0) {
      log.totalDuration = log.completedSubtasks.reduce((sum: number, completedId: mongoose.Types.ObjectId) => {
        const subtask = habit.subtasks.find((st: any) => st._id.toString() === completedId.toString());
        return sum + (subtask ? subtask.duration : 0);
      }, 0);
    }

    await log.save();

    return NextResponse.json({ message: "Log updated", log }, { status: 200 });
  } catch (error) {
    console.error("ActivityLogs POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
