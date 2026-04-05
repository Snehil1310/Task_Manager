"use client";

import { useEffect, useState } from "react";
import DateStrip from "@/components/DateStrip";
import HabitCard from "@/components/HabitCard";
import CreateHabitModal from "@/components/CreateHabitModal";
import MonthlySummaryCard from "@/components/MonthlySummaryCard";
import { DashboardHabit } from "@/types";
import { Plus, Loader2, LogOut, BarChart3, Sun, Moon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { isSameDay, startOfDay } from "date-fns";
import { useTheme } from "next-themes";

export default function Dashboard() {
  const { data: session } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<DashboardHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setHabits(data.habits);
      }
    } catch (err) {
      console.error("Failed to fetch habits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (habitId: string, isCompleted: boolean) => {
    const today = startOfDay(new Date());
    const target = startOfDay(selectedDate);
    if (!isSameDay(today, target)) {
      return; // Do nothing on UI level if not today
    }
    
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: selectedDate, isCompleted }),
      });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const nonArchivedHabits = habits.filter(h => {
    if (!h.archivedAt) return true;
    const targetDay = startOfDay(selectedDate).getTime();
    const boundaryDay = startOfDay(new Date(h.archivedAt)).getTime();
    return targetDay < boundaryDay;
  });
  
  const activeHabitsToday = nonArchivedHabits.filter(h => h.targetDays.includes(selectedDate.getDay()));
  const totalActiveToday = activeHabitsToday.length;
  const completedToday = activeHabitsToday.filter(h => h.logs.some(logDate => isSameDay(new Date(logDate), selectedDate))).length;
  const progressPercent = totalActiveToday === 0 ? 0 : Math.round((completedToday / totalActiveToday) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white pb-24 transition-colors">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-gray-200 dark:border-neutral-900 transition-colors">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hi, {firstName}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your timeline for today.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {mounted && (
            <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="p-2 text-gray-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors border border-gray-200 dark:border-neutral-800 rounded-full">
              {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button onClick={() => setIsSummaryOpen(!isSummaryOpen)} className={`p-2 transition-colors border rounded-full ${isSummaryOpen ? 'bg-yellow-500 text-black border-yellow-500' : 'text-gray-400 hover:text-black dark:text-neutral-500 dark:hover:text-white border-gray-200 dark:border-neutral-800'}`}>
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors border border-gray-200 dark:border-neutral-800 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide down Monthly Summary */}
      <div className="mt-6 max-w-2xl mx-auto">
         <MonthlySummaryCard isOpen={isSummaryOpen} habits={habits} />
      </div>

      {/* Date Strip & Progress */}
      <div className="px-2">
        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        
        {/* Daily Progress Bar */}
        <div className="px-4 mt-2 max-w-2xl mx-auto">
          <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
             <span>Daily Progress</span>
             <span>{completedToday} of {totalActiveToday} completed</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
             <div 
               className="h-full bg-yellow-500 transition-all duration-500 ease-out"
               style={{ width: `${progressPercent}%` }}
             />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 mt-8 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : activeHabitsToday.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-neutral-800 rounded-2xl">
            <h3 className="text-xl font-semibold text-black dark:text-gray-300">No habits today</h3>
            <p className="text-gray-500 mt-2">Take a breather, or add a new habit.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeHabitsToday.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                selectedDate={selectedDate}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 relative mx-auto flex items-center justify-center w-16 h-16 bg-yellow-500 text-black rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-transform z-20" style={{ left: "calc(50% - 2rem)"}}>
        <Plus className="w-8 h-8" />
      </button>

      {isModalOpen && (
        <CreateHabitModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchHabits} 
        />
      )}

      {/* Global overriding for scrollbar hiding using raw CSS inside JSX */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
