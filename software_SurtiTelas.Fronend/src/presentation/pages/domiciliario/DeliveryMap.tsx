import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Entrega } from './RutaDelDia';
import { Badge } from '@/shared/ui/Badge';
import s from './RutaDelDia.module.css';

const createIcon = (label: string, color: string) => {
  const size = 36;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="${color}" stroke="#fff" stroke-width="3"/>
      <text x="18" y="22" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">${label}</text>
    </svg>
  `;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const icon = new L.Icon({
    iconUrl: url,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
  return icon;
};

const statusColor = (estado: Entrega['estado']) => {
  if (estado === 'Entregado') return '#10b981';
  if (estado === 'En camino') return '#3b82f6';
  if (estado === 'Fallido') return '#ef4444';
  return '#f59e0b';
};

const FitMap = ({ markers }: { markers: { lat: number; lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || markers.length === 0) return;
    const first = markers[0];
    map.setView([first.lat, first.lng], 13);
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, markers]);
  return null;
};

const MapResize = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface DeliveryMapProps {
  entregas: Entrega[];
  onSelect: (entrega: Entrega) => void;
  selectedId?: string | null;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ entregas, onSelect, selectedId }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [center, setCenter] = useState<[number, number]>([4.6097, -74.0817]);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const geocodeAll = async () => {
      setLoadingMap(true);
      const results: { lat: number; lng: number }[] = [];
      for (const e of entregas) {
        const coord = await geocodeAddress(`${e.direccion}, ${e.barrio}`);
        if (cancelled) return;
        if (coord) results.push(coord);
      }
      if (!cancelled) {
        setCoords(results);
        if (results.length > 0) setCenter([results[0].lat, results[0].lng]);
        setLoadingMap(false);
      }
    };
    if (entregas.length > 0) {
      void geocodeAll();
    } else {
      setLoadingMap(false);
    }
    return () => { cancelled = true; };
  }, [entregas]);

  const markers = useMemo(() => {
    return entregas.map((e, idx) => {
      const coord = coords[idx];
      if (!coord) return null;
      return {
        id: e.id,
        position: [coord.lat, coord.lng] as [number, number],
        label: String(idx + 1),
        color: statusColor(e.estado),
        entrega: e,
      };
    }).filter(Boolean) as { id: string; position: [number, number]; label: string; color: string; entrega: Entrega }[];
  }, [entregas, coords]);

  return (
    <div className={s.mapContainer}>
      {loadingMap && (
        <div className={s.mapPlaceholder}>
          <div className={s.mapGrid} />
          <div className={s.mapIcon}><Map size={48} /></div>
          <div className={s.mapText}>Calculando coordenadas de la ruta...</div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={13}
        className={s.mapLeaflet}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResize />
        <FitMap markers={markers.map((m) => ({ lat: m.position[0], lng: m.position[1] }))} />
        {markers.map((m, idx) => {
          const icon = createIcon(m.label, m.color);
          return (
            <Marker
              key={m.id}
              position={m.position}
              icon={icon}
              eventHandlers={{
                click: () => onSelect(m.entrega),
              }}
            >
              <Popup>
                <div style={{ fontSize: 12 }}>
                  <strong>Parada {idx + 1}</strong>
                  <div>{m.entrega.cliente}</div>
                  <div>{m.entrega.direccion}, {m.entrega.barrio}</div>
                  <Badge variant={m.entrega.estado === 'Entregado' ? 'success' : m.entrega.estado === 'En camino' ? 'info' : m.entrega.estado === 'Fallido' ? 'danger' : 'warning'}>{m.entrega.estado}</Badge>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SurtiTelas-Domiciliario/1.0',
      },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const item = data[0];
    return { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
  } catch {
    return null;
  }
}
