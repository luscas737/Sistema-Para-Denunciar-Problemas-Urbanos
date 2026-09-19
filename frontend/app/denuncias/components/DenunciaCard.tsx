import Link from 'next/link';
import { Denuncia } from '@/lib/denuncias';
import StatusBadge, { rotuloCategoria } from './StatusBadge';

export default function DenunciaCard({ denuncia }: { denuncia: Denuncia }) {
  return (
    <Link
      href={`/denuncias/${denuncia.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">{denuncia.titulo}</h2>
        <StatusBadge status={denuncia.status} />
      </div>
      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{denuncia.descricao}</p>
      <p className="text-xs text-slate-500 mt-2">
        {rotuloCategoria(denuncia.categoria)} · {new Date(denuncia.criadoEm).toLocaleDateString('pt-BR')}
      </p>
    </Link>
  );
}
