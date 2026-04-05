import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISubtask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  duration: number; // in minutes
}

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  themeColor: string;
  icon: string;
  targetDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  subtasks: ISubtask[];
  archivedAt?: Date;
  createdAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true, default: 15 },
  },
  { _id: true }
);

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    themeColor: { type: String, required: true, default: "#facc15" },
    icon: { type: String, required: true, default: "Dumbbell" },
    targetDays: {
      type: [Number],
      required: true,
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    subtasks: { type: [SubtaskSchema], default: [] },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

// Force clear the Next.js cached model so the new schema changes (archivedAt) register instantly natively
if (mongoose.models.Habit) {
  delete mongoose.models.Habit;
}

const Habit = model<IHabit>("Habit", HabitSchema);
export default Habit;
