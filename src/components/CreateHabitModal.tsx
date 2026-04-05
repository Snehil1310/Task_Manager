"use client";

import { useState } from "react";
import { Check, X, Plus, Trash } from "lucide-react";

interface CreateHabitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateHabitModal({ onClose, onSuccess }: CreateHabitModalProps) {
  const [title, setTitle] = useState("");
  const [themeColor, setThemeColor] = useState("#facc15");
  const [icon, setIcon] = useState("Dumbbell");
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [subtasks, setSubtasks] = useState<{title: string, duration: number}[]>([]);
  const [loading, setLoading] = useState(false);

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const handleToggleDay = (dayIndex: number) => {
    if (targetDays.includes(dayIndex)) {
      setTargetDays(targetDays.filter(d => d !== dayIndex));
    } else {
      setTargetDays([...targetDays, dayIndex]);
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { title: "", duration: 15 }]);
  };

  const handleUpdateSubtask = (index: number, key: string, value: string | number) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], [key]: value };
    setSubtasks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          themeColor,
          icon,
          targetDays,
          subtasks
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New Habit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Habit Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
              placeholder="e.g. Morning Run"
            />
          </div>

          {/* Target Days */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Target Days</label>
            <div className="flex justify-between gap-1">
              {days.map((day, idx) => {
                const isSelected = targetDays.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${isSelected ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">Subtasks</label>
              <button type="button" onClick={handleAddSubtask} className="text-yellow-500 text-sm flex items-center gap-1 hover:text-yellow-400">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="space-y-3">
              {subtasks.map((st, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input 
                    required
                    type="text" 
                    value={st.title}
                    onChange={(e) => handleUpdateSubtask(i, 'title', e.target.value)}
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Task name"
                  />
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={st.duration}
                    onChange={(e) => handleUpdateSubtask(i, 'duration', parseInt(e.target.value) || 0)}
                    className="w-20 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                    placeholder="min"
                  />
                  <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Theme Color</label>
            <div className="flex gap-3">
              {[
                { hex: "#eab308", name: "Yellow" },
                { hex: "#ef4444", name: "Red" },
                { hex: "#22c55e", name: "Green" },
                { hex: "#3b82f6", name: "Blue" },
                { hex: "#a855f7", name: "Purple" }
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setThemeColor(c.hex)}
                  className={`w-10 h-10 rounded-full transition-all border-2 ${themeColor === c.hex ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-bold rounded-xl py-3 hover:bg-yellow-400 disabled:opacity-50"
             >
               {loading ? "Creating..." : "Save Habit"}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
