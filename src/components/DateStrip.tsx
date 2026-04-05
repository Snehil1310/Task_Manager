"use client";

import { useRef, useEffect } from "react";
import { format, addDays, subDays, startOfDay, isSameDay } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate 7 days before and 7 days after today
  const today = startOfDay(new Date());
  const dates = Array.from({ length: 15 }, (_, i) => addDays(subDays(today, 7), i));

  // Center scroll on load
  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div 
      ref={containerRef}
      className="flex overflow-x-auto hide-scrollbar gap-4 py-4 px-4 sm:px-6 w-full -mx-4 sm:-mx-6"
    >
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        
        return (
          <button
            key={date.toISOString()}
            data-selected={isSelected}
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-full border-2 transition-all duration-200",
              isSelected 
                ? "border-yellow-500 bg-white dark:bg-[#1a1a1a] text-yellow-500 shadow-sm dark:shadow-none" 
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#1a1a1a]",
              isToday && !isSelected && "text-black dark:text-white font-bold"
            )}
          >
            <span className="text-xs uppercase tracking-wider mb-1">
              {format(date, "EEE")}
            </span>
            <span className={cn(
              "text-lg font-semibold",
              isSelected ? "text-black dark:text-white" : ""
            )}>
              {format(date, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
