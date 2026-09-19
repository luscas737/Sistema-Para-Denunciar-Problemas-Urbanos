'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { listarDenuncias, Denuncia, categorias, statusLista } from '@/lib/denuncias';
import DenunciaCard from './components/DenunciaCard';

export default function DenunciasPage() {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const resultado = await listarDenuncias({ categoria: categoria || undefined, status: status || undefined });
      setDenuncias(resultado);
    } catch {
      setErro('Nao foi possivel carregar as denuncias. Verifique se o backend esta em execucao.');
    } finally {
      setCarregando(false);
    }
  }, [categoria, status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold">Denuncias</h1>
        <Link href="/denuncias/nova" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
          Nova denuncia
        </Link>
      </div>

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

      {carregando && <p className="text-slate-500">Carregando denuncias...</p>}
      {erro && <p className="text-red-600">{erro}</p>}
      {!carregando && !erro && denuncias.length === 0 && (
        <p className="text-slate-500">Nenhuma denuncia encontrada.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {denuncias.map((d) => (
          <DenunciaCard key={d.id} denuncia={d} />
        ))}
      </div>
    </div>
  );
}
