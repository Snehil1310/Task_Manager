"use client";

import { DashboardHabit } from "@/types";
import HeatmapGrid from "./HeatmapGrid";
import { Check, Dumbbell, Book, Code, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { isSameDay } from "date-fns";

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Book: <Book className="w-5 h-5" />,
  Play: <Play className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  default: <Check className="w-5 h-5" />
};

export default function HabitCard({
  habit,
  selectedDate,
  onToggle,
  onDelete
}: {
  habit: DashboardHabit;
  selectedDate: Date;
  onToggle: (habitId: string, isCompleted: boolean) => void;
  onDelete: (habitId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Determine if it is completed on selected date
  const isCompletedToday = habit.logs.some((logDate) => isSameDay(new Date(logDate), selectedDate));
  
  const Icon = iconMap[habit.icon] || iconMap.default;

  return (
    <div className="bg-white dark:bg-[#121212] rounded-[20px] p-4 mb-4 border border-gray-200 dark:border-[#1e1e1e] shadow-sm dark:shadow-none transition-all">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-opacity-10 shrink-0"
            style={{ backgroundColor: `${habit.themeColor}20`, color: habit.themeColor }}
          >
            {Icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[17px] font-bold text-black dark:text-white tracking-wide truncate">{habit.title}</h3>
            <p className="text-[13px] text-gray-500 font-medium truncate">{habit.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {new Date().toDateString() === selectedDate.toDateString() && (
            isConfirmingDelete ? (
              <div className="flex items-center gap-1">
                 <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    onDelete(habit._id);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-colors"
                 >
                   Delete?
                 </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsConfirmingDelete(true);
                }}
                className="text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <Trash2 className="w-5 h-5 pointer-events-none" />
              </button>
            )
          )}

          {habit.subtasks?.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className={`w-5 h-5 transform transition ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          )}

          <button
            onClick={() => {
              if (selectedDate.toDateString() === new Date().toDateString()) {
                onToggle(habit._id, !isCompletedToday);
              }
            }}
            disabled={selectedDate.toDateString() !== new Date().toDateString()}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              borderColor: habit.themeColor,
              backgroundColor: isCompletedToday ? habit.themeColor : "transparent",
              color: isCompletedToday ? "#000" : habit.themeColor
            }}
          >
            {isCompletedToday ? <Check className="w-5 h-5 stroke-[3]" /> : null}
          </button>
        </div>
      </div>

      {isExpanded && habit.subtasks?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
          {habit.subtasks.map((st, i) => (
             <div key={i} className="flex justify-between items-center text-sm text-gray-300">
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-neutral-600" />
                   {st.title}
                </span>
                <span className="text-neutral-500">{st.duration} min</span>
             </div>
          ))}
        </div>
      )}

      <HeatmapGrid logs={habit.logs} targetDays={habit.targetDays} themeColor={habit.themeColor} />
    </div>
  );
}
