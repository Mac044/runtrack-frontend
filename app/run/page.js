"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useGeolocationTracker } from "../../hooks/useGeolocationTracker";
import { saveRun } from "../../lib/api";

// Leaflet touches `window`, so it can only render on the client
const RunMap = dynamic(() => import("../../components/RunMap"), { ssr: false });

export default function RunPage() {
  const router = useRouter();
  const { route, distanceMeters, isTracking, error, start, stop } = useGeolocationTracker();
  const [saving, setSaving] = useState(false);

  const handleStop = async () => {
    const summary = stop();

    if (summary.route.length < 2) {
      router.push("/");
      return;
    }

    setSaving(true);
    try {
      const avgPaceSecPerKm =
        summary.distanceMeters > 0
          ? summary.durationSeconds / (summary.distanceMeters / 1000)
          : 0;

      await saveRun({
        startTime: summary.startTime,
        endTime: summary.endTime,
        distanceMeters: summary.distanceMeters,
        durationSeconds: summary.durationSeconds,
        avgPaceSecPerKm,
        route: summary.route,
      });

      router.push("/");
    } catch (err) {
      console.error("Failed to save run:", err);
      alert("Could not save your run. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">
        <RunMap route={route} />
      </div>

      <div className="bg-neutral-950 px-6 py-6">
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="mb-4 flex justify-around text-center">
          <div>
            <div className="text-xs uppercase text-neutral-500">Distance</div>
            <div className="text-3xl font-bold text-white">{(distanceMeters / 1000).toFixed(2)} km</div>
          </div>
        </div>

        {!isTracking ? (
          <button
            onClick={start}
            className="w-full rounded-full bg-orange-600 py-4 text-lg font-semibold text-white"
          >
            Start Run
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={saving}
            className="w-full rounded-full bg-red-600 py-4 text-lg font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Stop & Save"}
          </button>
        )}
      </div>
    </div>
  );
}