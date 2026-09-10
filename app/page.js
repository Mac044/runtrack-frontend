"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getRunStats } from "../lib/api";

export default function HomePage() {
  const { user, loading, signIn, logOut } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      getRunStats().then(setStats).catch(console.error);
    }
  }, [user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold">RunTrack</h1>
        <p className="text-neutral-400">Track your runs. See your pace. Beat yesterday.</p>
        <button
          onClick={signIn}
          className="rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hey, {user.displayName?.split(" ")[0] || "Runner"}</h1>
        <button onClick={logOut} className="text-sm text-neutral-400 underline">
          Sign out
        </button>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="This week" value={`${(stats?.weeklyDistanceKm ?? 0).toFixed(1)} km`} />
        <StatCard label="Total distance" value={`${(stats?.totalDistanceKm ?? 0).toFixed(1)} km`} />
        <StatCard label="Total runs" value={stats?.runCount ?? 0} />
        <StatCard label="Avg pace" value={formatPace(stats?.avgPaceSecPerKm)} />
      </section>

      <div className="flex gap-4">
        <a
          href="/run"
          className="rounded-full bg-orange-600 px-8 py-4 font-semibold text-white hover:opacity-90"
        >
          Start a run
        </a>
        <a
          href="/history"
          className="rounded-full border border-neutral-700 px-8 py-4 font-semibold text-black hover:text-white hover:bg-neutral-900"
        >
          View history
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-neutral-900 p-4">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function formatPace(secPerKm) {
  if (!secPerKm) return "--:--";
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}