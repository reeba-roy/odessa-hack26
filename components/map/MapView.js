"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMapPoints } from "@/lib/mapData.mjs";

const makeClusterIcon = (isSelected) =>
  L.divIcon({
    className: "cluster-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${isSelected ? 30 : 24}px;height:${isSelected ? 30 : 24}px;border-radius:9999px;background:${isSelected ? "#16a34a" : "#0f172a"};color:white;border:2px solid white;font-size:${isSelected ? 11 : 10}px;font-weight:700;box-shadow:0 8px 20px rgba(15,23,42,0.18);">C</span>`,
    iconSize: [isSelected ? 30 : 24, isSelected ? 30 : 24],
    iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12],
  });

const makeFarmerIcon = () =>
  L.divIcon({
    className: "farmer-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#22c55e;color:white;border:2px solid white;font-size:10px;font-weight:800;box-shadow:0 8px 20px rgba(15,23,42,0.20);">F</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

export default function MapView({ clusters, listings, selectedCluster, onSelectCluster, mode = "clusters" }) {
  const points = getMapPoints({ clusters, listings, mode });
  const center = points.length ? [points[0].lat, points[0].lng] : [10.3, 76.5];

  return (
    <div className="relative z-0 h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer center={center} zoom={8} scrollWheelZoom className="h-full w-full !z-0" style={{ zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((point) =>
          point.type === "cluster" ? (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={makeClusterIcon(selectedCluster?.id === point.id)}
              eventHandlers={{
                click: () => onSelectCluster(clusters.find((cluster) => cluster.id === point.id) ?? null),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <strong>{point.region}</strong>
                  <div>{point.totalTonnes} tonnes</div>
                  <div>{point.status}</div>
                </div>
              </Popup>
            </Marker>
          ) : (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={makeFarmerIcon()}
              eventHandlers={{
                click: () => onSelectCluster(clusters.find((cluster) => cluster.id === point.clusterId) ?? null),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <strong>{point.farmerName}</strong>
                  <div>{point.cropType || 'Waste'}</div>
                  <div>{point.quantityTonnes} tonnes</div>
                </div>
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}
