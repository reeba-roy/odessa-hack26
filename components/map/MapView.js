"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const clusterIcon = (isSelected) =>
  L.divIcon({
    className: "cluster-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${isSelected ? 30 : 24}px;height:${isSelected ? 30 : 24}px;border-radius:9999px;background:${isSelected ? "#16a34a" : "#0f172a"};color:white;border:2px solid white;font-size:${isSelected ? 11 : 10}px;font-weight:700;box-shadow:0 8px 20px rgba(15,23,42,0.18);">C</span>`,
    iconSize: [isSelected ? 30 : 24, isSelected ? 30 : 24],
    iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12],
  });

export default function MapView({ clusters, selectedCluster, onSelectCluster }) {
  const center = [10.3, 76.5];

  return (
    <div className="h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer center={center} zoom={8} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={[cluster.lat, cluster.lng]}
            icon={clusterIcon(selectedCluster?.id === cluster.id)}
            eventHandlers={{
              click: () => onSelectCluster(cluster),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <strong>{cluster.region}</strong>
                <div>{cluster.totalTonnes} tonnes</div>
                <div>{cluster.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
