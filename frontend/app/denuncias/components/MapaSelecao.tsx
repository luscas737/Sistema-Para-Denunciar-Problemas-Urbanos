'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const CENTRO_PADRAO: [number, number] = [-8.9016, -36.4926];

const iconeMarcador = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

function CapturaClique({ onSelecionar }: { onSelecionar: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(evento) {
      onSelecionar(evento.latlng.lat, evento.latlng.lng);
    },
  });
  return null;
}

function Centralizar({ posicao }: { posicao: [number, number] }) {
  const mapa = useMap();
  const [latitude, longitude] = posicao;
  useEffect(() => {
    mapa.setView([latitude, longitude], mapa.getZoom(), { animate: true });
  }, [latitude, longitude, mapa]);
  return null;
}

export default function MapaSelecao({
  latitude,
  longitude,
  onSelecionar,
}: {
  latitude: number | null;
  longitude: number | null;
  onSelecionar: (latitude: number, longitude: number) => void;
}) {
  const marcador: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  return (
    <MapContainer
      center={marcador ?? CENTRO_PADRAO}
      zoom={15}
      scrollWheelZoom
      className="h-72 w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CapturaClique onSelecionar={onSelecionar} />
      {marcador && (
        <>
          <Centralizar posicao={marcador} />
          <Marker position={marcador} icon={iconeMarcador} />
        </>
      )}
    </MapContainer>
  );
}
