"use client";

import { DashboardHabit } from "@/types";
import { isSameMonth } from "date-fns";
import { Flame, CheckCircle, Target } from "lucide-react";

interface MonthlySummaryCardProps {
  isOpen: boolean;
  habits: DashboardHabit[];
}

export default function MonthlySummaryCard({ isOpen, habits }: MonthlySummaryCardProps) {
  if (!isOpen) return null;

  const currentMonth = new Date();

  // Basic client-side math for the month
  let totalTargetsThisMonth = 0;
  let totalCompletedThisMonth = 0;
  let topStreak = 0;

  habits.forEach((habit) => {
    // Top streak comparison
    if (habit.streak > topStreak) topStreak = habit.streak;

    // Filter logs for this month
    const monthlyLogs = habit.logs.filter((logDate) => isSameMonth(new Date(logDate), currentMonth));
    totalCompletedThisMonth += monthlyLogs.length;

    // Approximate target days mapping for the month
    // (A precise calculation requires iterating over every day of the month, 
    // but for simplicity we assume ~4 of each weekday per month)
    totalTargetsThisMonth += habit.targetDays.length * 4.33; 
  });

  const completionRate = totalTargetsThisMonth === 0 
    ? 0 
    : Math.min(100, Math.round((totalCompletedThisMonth / totalTargetsThisMonth) * 100));

  return (
    <div className="px-6 mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white dark:bg-[#121212] p-5 rounded-[20px] border border-gray-200 dark:border-[#1e1e1e] shadow-lg">
        <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-500" />
          Monthly Overview
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-black rounded-2xl p-4 border border-gray-200 dark:border-neutral-800 flex flex-col items-center justify-center">
             <div className="text-3xl font-black text-yellow-500">{completionRate}%</div>
             <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Success Rate</div>
          </div>
          
          <div className="flex flex-col gap-4">
             <div className="bg-black rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
               <div className="bg-green-500/20 p-2 rounded-full">
                 <CheckCircle className="w-4 h-4 text-green-500" />
               </div>
               <div>
                  <div className="text-lg font-bold text-black dark:text-white">{totalCompletedThisMonth}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Completions</div>
               </div>
             </div>

             <div className="bg-black rounded-xl p-3 border border-neutral-800 flex items-center gap-3">
               <div className="bg-orange-500/20 p-2 rounded-full">
                 <Flame className="w-4 h-4 text-orange-500" />
               </div>
               <div>
                  <div className="text-lg font-bold text-black dark:text-white">{topStreak} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">days</span></div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Top Streak</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
