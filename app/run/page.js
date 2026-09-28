"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useGeolocationTracker } from "../../hooks/useGeolocationTracker";
import { saveRun } from "../../lib/api";

const RunMap = dynamic(() => import("../../components/RunMap"), { ssr: false });

export default function RunPage() {
  const router = useRouter();
  const { route, distanceMeters, isTracking, error, start, stop } = useGeolocationTracker();
  const [saving, setSaving] = useState(false);
  const wakeLockRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.error("Wake lock request failed:", err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release();
    } catch (err) {
      console.error("Wake lock release failed:", err);
    } finally {
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTracking && document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isTracking]);

  const handleStart = () => {
    start();
    requestWakeLock();
  };

  const handleStop = async () => {
    const summary = stop();
    await releaseWakeLock();

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
            onClick={handleStart}
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