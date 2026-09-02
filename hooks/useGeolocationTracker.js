import { useState, useRef, useCallback, useEffect } from "react";

function distanceBetween(a, b) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export function useGeolocationTracker() {
  const [route, setRoute] = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setRoute([]);
    setDistanceMeters(0);
    setError(null);
    startTimeRef.current = Date.now();
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setRoute((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const segment = distanceBetween(last, point);
            // Ignore GPS jitter (<3m) and unrealistic jumps (>=200m)
            if (segment < 200 && segment > 3) {
              setDistanceMeters((d) => d + segment);
            }
          }
          return [...prev, point];
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);

    const endTime = Date.now();
    const durationSeconds = startTimeRef.current
      ? Math.round((endTime - startTimeRef.current) / 1000)
      : 0;

    return { startTime: startTimeRef.current, endTime, durationSeconds, distanceMeters, route };
  }, [distanceMeters, route]);

  // Clear the GPS watch if the component unmounts mid-run
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { route, distanceMeters, isTracking, error, start, stop };
}