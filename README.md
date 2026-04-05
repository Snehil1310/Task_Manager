# 📝 Task & Habit Tracker

A beautiful, sleek, production-ready Habit Tracking dashboard built with the modern Next.js App Router paradigm.

![Habit Tracker Dashboard](public/preview.png)

## ✨ Core Features
- **Smart Analytics Dashboard:** Dynamic timeline rendering with daily progression tracking.
- **Monthly Summary Cards:** Slide-down graphical analytics parsing your long-term consistency.
- **Dynamic Theming Support:** Full integration of Native Dark & Light modes with system resolution via `next-themes` and `Tailwind v4`.
- **Intelligent Habit Archiving:** Safely drop/delete a habit starting "today", absolutely preserving the mathematical integrity of historical streaks and heatmap grids without hard-deleting database records.
- **Heatmaps Output:** Detailed Github-style daily tracking nodes mapped intelligently to sub-task logic.
- **Robust Architecture:** Server side Next.js 15 routing, backed securely by MongoDB Atlas & Auth.js (NextAuth).

## 🚀 Quick Setup
1. Clone the repository
2. Install standard dependencies:
```bash
npm install
```
3. Establish your environment secrets in a `.env.local` inside the root directory:
```env
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster.mongodb.net/habit-tracker
AUTH_SECRET=<super-secret-nextauth-hash>
AUTH_TRUST_HOST=true
```
4. Build and boot the local engine:
```bash
npm run dev
```

## 🏗️ Deployment
Optimized flawlessly for zero-configuration deployments on the [Vercel](https://vercel.com/) Edge Network.
