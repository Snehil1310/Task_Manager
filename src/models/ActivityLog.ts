import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date; // normalized to midnight UTC
  isCompleted: boolean;
  completedSubtasks: mongoose.Types.ObjectId[];
  totalDuration: number; // minutes
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedSubtasks: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index: one log per user per habit per date
ActivityLogSchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true });

const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
