import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Habit from "@/models/Habit";
import { startOfDay } from "date-fns";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: "Boundary Date is required" }, { status: 400 });
    }

    await dbConnect();
    const userId = session.user.id;
    const archivedDate = startOfDay(new Date(date));
    const resolvedParams = await params;

    // We don't hard delete, we set the archivedAt bound
    const habit = await Habit.findOneAndUpdate(
      { _id: resolvedParams.id, userId },
      { $set: { archivedAt: archivedDate } },
      { new: true }
    );

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Habit physically archived.", habit }, { status: 200 });
  } catch (error) {
    console.error("Habit DELETE/Archive error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
