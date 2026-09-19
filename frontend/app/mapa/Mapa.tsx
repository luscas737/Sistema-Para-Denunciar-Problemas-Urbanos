'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { DenunciaResumo } from '@/lib/denuncias';
import { rotuloCategoria, rotuloStatus } from '../denuncias/components/StatusBadge';

const coresCategorias: Record<string, string> = {
  buraco: '#ea580c',
  poste: '#7c3aed',
  lixo: '#16a34a',
  agua: '#0284c7',
  outros: '#64748b',
};

function icone(categoria: string) {
  const cor = coresCategorias[categoria] ?? '#64748b';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${cor};border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export default function Mapa({ denuncias }: { denuncias: DenunciaResumo[] }) {
  return (
    <MapContainer
      center={[-8.9016, -36.4926]}
      zoom={13}
      scrollWheelZoom
      className="h-96 rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {denuncias.map((d) => (
        <Marker key={d.id} position={[d.latitude, d.longitude]} icon={icone(d.categoria)}>
          <Popup>
            <span className="font-semibold block">{d.titulo}</span>
            <span className="text-xs text-slate-500 block mb-1">
              {rotuloCategoria(d.categoria)} · {rotuloStatus(d.status)}
            </span>
            <Link href={`/denuncias/${d.id}`} className="text-blue-600 hover:underline text-sm">
              Ver denuncia
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
