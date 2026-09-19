'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Denuncia, removerDenuncia, obterDenuncia } from '@/lib/denuncias';
import StatusBadge, { rotuloCategoria } from '../components/StatusBadge';

export default function DenunciaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [erro, setErro] = useState('');
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    if (!id) return;
    obterDenuncia(id)
      .then(setDenuncia)
      .catch(() => setErro('Nao foi possivel carregar a denuncia.'));
  }, [id]);

  async function remover() {
    if (!id || !window.confirm('Remover esta denuncia?')) return;
    setRemovendo(true);
    try {
      await removerDenuncia(id);
      window.location.href = '/denuncias';
    } catch {
      setErro('Nao foi possivel remover a denuncia.');
      setRemovendo(false);
    }
  }

  if (erro) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{erro}</p>
        <Link href="/denuncias" className="text-blue-600 hover:underline text-sm">
          Voltar para denuncias
        </Link>
      </div>
    );
  }

  if (!denuncia) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/denuncias" className="text-sm text-blue-600 hover:underline">
          Voltar
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/denuncias/${denuncia.id}/editar`}
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50"
          >
            Editar
          </Link>
          <button
            onClick={remover}
            disabled={removendo}
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {removendo ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>

      <article className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold">{denuncia.titulo}</h1>
          <StatusBadge status={denuncia.status} />
        </div>
        <p className="text-sm text-slate-500">{rotuloCategoria(denuncia.categoria)}</p>
        {denuncia.foto && (
          <img src={denuncia.foto} alt={denuncia.titulo} className="rounded-lg max-h-80 w-full object-cover" />
        )}
        <p className="text-slate-700">{denuncia.descricao}</p>
        <div className="text-sm text-slate-500 space-y-1">
          <p>
            Localizacao: {denuncia.latitude}, {denuncia.longitude}
          </p>
          <p>Registrada em {new Date(denuncia.criadoEm).toLocaleString('pt-BR')}</p>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${denuncia.latitude}&mlon=${denuncia.longitude}#map=17/${denuncia.latitude}/${denuncia.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Ver no mapa
        </a>
      </article>
    </div>
  );
}
