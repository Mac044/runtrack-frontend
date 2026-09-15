"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "../../../hooks/useAuth";
import { getRunById } from "../../../lib/api";

const RunMap = dynamic(() => import("../../../components/RunMap"), { ssr: false });

export default function RunDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    getRunById(id)
      .then(setRun)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, user, id]);

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error || !run) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "Run not found"}</p>
        <button onClick={() => router.push("/history")} className="text-sm text-neutral-400 underline">
          Back to history
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">
        <RunMap route={run.route} />
      </div>

      <div className="bg-neutral-950 px-6 py-6">
        <div className="mb-4 flex justify-around text-center">
          <div>
            <div className="text-xs uppercase text-neutral-500">Distance</div>
            <div className="text-2xl font-bold text-white">{(run.distanceMeters / 1000).toFixed(2)} km</div>
          </div>
          <div>
            <div className="text-xs uppercase text-neutral-500">Duration</div>
            <div className="text-2xl font-bold text-white">{formatDuration(run.durationSeconds)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-neutral-500">Pace</div>
            <div className="text-2xl font-bold text-white">{formatPace(run.avgPaceSecPerKm)}</div>
          </div>
        </div>

        <button
          onClick={() => router.push("/history")}
          className="w-full rounded-full border border-neutral-700 py-3 text-sm font-semibold text-white hover:bg-neutral-900"
        >
          Back to history
        </button>
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