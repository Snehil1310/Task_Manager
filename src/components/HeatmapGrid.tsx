"use client";

import { startOfWeek, addDays, isSameDay } from "date-fns";

interface HeatmapGridProps {
  logs: Date[]; 
  targetDays: number[];
  themeColor: string;
}

export default function HeatmapGrid({ logs, targetDays, themeColor }: HeatmapGridProps) {
  // Let's generate a 7 col x N row grid for the last 140 days (20 weeks)
  const today = new Date();
  const numWeeks = 20;
  const numDays = numWeeks * 7;
  
  // Get Sunday of the current week, then subtract (numWeeks - 1) weeks.
  const startDate = addDays(startOfWeek(today), -(numWeeks - 1) * 7); 

  const days = Array.from({ length: numDays }, (_, i) => addDays(startDate, i));

  return (
    <div className="mt-5 w-full overflow-hidden hide-scrollbar">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-full min-w-max">
        {days.map((day, i) => {
          const isTarget = targetDays.includes(day.getDay());
          const isCompleted = logs.some((logDate) => isSameDay(new Date(logDate), day));
          
          let bgColor = "bg-[#2a2a2a]"; // default inactive dim gray/brown
          
          if (!isTarget) {
            bgColor = "bg-[#1a1a1a]"; // very dim if not a target day
          }
          if (isCompleted) {
             // Fully bright colored if completed
            return (
               <div
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: themeColor }}
                  title={day.toDateString()}
               />
            );
          } else if (day < today && isTarget) {
            // Missed target! Usually still dim or slightly distinct
            bgColor = "bg-[#2d2a23]"; 
          } else if (day > today) {
            bgColor = "bg-[#1f1f1f]" // future
          }

          return (
            <div
              key={i}
              className={`w-[10px] h-[10px] rounded-[2px] ${bgColor}`}
              title={day.toDateString()}
            />
          );
        })}
      </div>
    </div>
  );
}
