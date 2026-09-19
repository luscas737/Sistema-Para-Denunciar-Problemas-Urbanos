import Link from 'next/link';
import { Denuncia, categorias, statusLista } from '@/lib/denuncias';

export function rotuloCategoria(valor: string) {
  return categorias.find((c) => c.valor === valor)?.rotulo ?? valor;
}

export function rotuloStatus(valor: string) {
  return statusLista.find((s) => s.valor === valor)?.rotulo ?? valor;
}

const coresStatus: Record<string, string> = {
  recebida: 'bg-slate-200 text-slate-700',
  encaminhada: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-amber-100 text-amber-700',
  resolvida: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${coresStatus[status] ?? 'bg-slate-200'}`}>
      {rotuloStatus(status)}
    </span>
  );
}
