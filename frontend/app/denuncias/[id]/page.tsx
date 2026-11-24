'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Anexo,
  Denuncia,
  listarAnexos,
  obterDenuncia,
  removerAnexo,
  removerDenuncia,
} from '@/lib/denuncias';
import StatusBadge, { rotuloCategoria } from '../components/StatusBadge';

export default function DenunciaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [erro, setErro] = useState('');
  const [removendo, setRemovendo] = useState(false);
  const [removendoAnexo, setRemovendoAnexo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      const [d, anexosLista] = await Promise.all([
        obterDenuncia(id),
        listarAnexos(id),
      ]);
      setDenuncia(d);
      setAnexos(anexosLista);
    } catch {
      setErro('Nao foi possivel carregar a denuncia.');
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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

  async function removerFoto(anexoId: string) {
    if (!id || !window.confirm('Remover esta foto?')) return;
    setRemovendoAnexo(anexoId);
    try {
      await removerAnexo(id, anexoId);
      setAnexos((atual) => atual.filter((a) => a.id !== anexoId));
    } catch {
      setErro('Nao foi possivel remover a foto.');
    } finally {
      setRemovendoAnexo(null);
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
          <img
            src={denuncia.foto}
            alt={denuncia.titulo}
            className="rounded-lg max-h-80 w-full object-cover"
          />
        )}
        {anexos.filter((a) => a.tipo === 'imagem').length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Fotos</h3>
            <div className="grid sm:grid-cols-3 gap-2">
              {anexos
                .filter((a) => a.tipo === 'imagem')
                .map((anexo) => (
                  <div key={anexo.id} className="relative group">
                    <img
                      src={anexo.url}
                      alt="Foto da denuncia"
                      className="w-full h-32 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      disabled={removendoAnexo === anexo.id}
                      onClick={() => removerFoto(anexo.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      ×
                    </button>
                    {anexo.descricao && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {anexo.descricao}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        {anexos.filter((a) => a.tipo === 'documento').length > 0 && (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-700">Documentos</h3>
            {anexos
              .filter((a) => a.tipo === 'documento')
              .map((anexo) => (
                <div key={anexo.id} className="flex items-center gap-2">
                  <a
                    href={anexo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate"
                  >
                    {anexo.descricao || anexo.url.split('/').pop() || 'Documento'}
                  </a>
                  <button
                    type="button"
                    disabled={removendoAnexo === anexo.id}
                    onClick={() => removerFoto(anexo.id)}
                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
          </div>
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
