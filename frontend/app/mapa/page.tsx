'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { DenunciaResumo, listarDenuncias, statusLista, categorias } from '@/lib/denuncias';

const Mapa = dynamic(() => import('./Mapa'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />,
});

const coresCategorias: Record<string, string> = {
  buraco: '#ea580c',
  poste: '#7c3aed',
  lixo: '#16a34a',
  agua: '#0284c7',
  outros: '#64748b',
};

export default function MapaPage() {
  const [denuncias, setDenuncias] = useState<DenunciaResumo[]>([]);
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    listarDenuncias({ categoria: categoria || undefined, status: status || undefined }).then((todas) => {
      setDenuncias(
        todas.map((d) => ({
          id: d.id,
          titulo: d.titulo,
          categoria: d.categoria,
          status: d.status,
          latitude: d.latitude,
          longitude: d.longitude,
        })),
      );
    });
  }, [categoria, status]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mapa de denuncias</h1>
      <p className="text-sm text-slate-600">
        Cada marcador representa um problema urbano registrado. Clique em um marcador para ver os detalhes.
      </p>
      <div className="flex flex-wrap gap-3">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.rotulo}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos os status</option>
          {statusLista.map((s) => (
            <option key={s.valor} value={s.valor}>
              {s.rotulo}
            </option>
          ))}
        </select>
      </div>
      <Mapa denuncias={denuncias} />
      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
        {Object.entries(coresCategorias).map(([valor, cor]) => (
          <span key={valor} className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: cor }} />
            {categorias.find((c) => c.valor === valor)?.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}
