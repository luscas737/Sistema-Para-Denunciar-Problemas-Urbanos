'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Denuncia, obterDenuncia } from '@/lib/denuncias';
import DenunciaForm from '../../components/DenunciaForm';

export default function DenunciaFormWrapper() {
  const { id } = useParams<{ id: string }>();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    obterDenuncia(id)
      .then(setDenuncia)
      .catch(() => setErro('Nao foi possivel carregar a denuncia.'));
  }, [id]);

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

  return <DenunciaForm denuncia={denuncia} />;
}
