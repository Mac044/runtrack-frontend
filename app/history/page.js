"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { getRuns } from "../../lib/api";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    getRuns()
      .then(setRuns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your runs</h1>
        <Link href="/" className="text-sm text-neutral-400 underline">
          Back home
        </Link>
      </div>

      {(authLoading || loading) && <p className="text-neutral-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!authLoading && !loading && !error && runs.length === 0 && (
        <p className="text-neutral-400">No runs yet. Go run something!</p>
      )}

      <div className="flex flex-col gap-3">
        {runs.map((run) => (
          <Link
            key={run._id}
            href={`/history/${run._id}`}
            className="block rounded-xl bg-neutral-900 p-4 hover:bg-neutral-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {new Date(run.startTime).toLocaleDateString()}
              </span>
              <span className="text-neutral-500">
                {new Date(run.startTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-2 flex gap-6 text-sm text-neutral-400">
              <span>{(run.distanceMeters / 1000).toFixed(2)} km</span>
              <span>{formatDuration(run.durationSeconds)}</span>
              <span>{formatPace(run.avgPaceSecPerKm)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPace(secPerKm) {
  if (!secPerKm) return "--:--";
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}