"use client";

import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Leaflet marker icons reference files that don't resolve correctly
// under bundlers like webpack/Next - this fixes that.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterOnLatest({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function RunMap({ route = [] }) {
  const positions = route.map((p) => [p.lat, p.lng]);
  const current = positions.length ? positions[positions.length - 1] : null;
  const fallbackCenter = [6.5244, 3.3792]; // Lagos, used until GPS locks on

  return (
    <MapContainer
      center={current || fallbackCenter}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 && <Polyline positions={positions} color="#ea580c" weight={4} />}
      {current && <Marker position={current} />}
      {current && <RecenterOnLatest position={current} />}
    </MapContainer>
  );
}