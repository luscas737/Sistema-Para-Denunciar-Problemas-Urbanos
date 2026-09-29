'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Denuncia,
  DenunciaFormData,
  atualizarDenuncia,
  categorias,
  criarDenuncia,
  denunciaSchema,
  statusLista,
} from '@/lib/denuncias';

const MapaSelecao = dynamic(() => import('./MapaSelecao'), {
  ssr: false,
  loading: () => <div className="h-72 w-full bg-slate-200 rounded-xl animate-pulse" />,
});

type Erros = Partial<Record<keyof DenunciaFormData | 'form', string>>;

export default function DenunciaForm({ denuncia }: { denuncia?: Denuncia }) {
  const router = useRouter();
  const [form, setForm] = useState({
    titulo: denuncia?.titulo ?? '',
    descricao: denuncia?.descricao ?? '',
    categoria: denuncia?.categoria ?? '',
    latitude: denuncia ? String(denuncia.latitude) : '',
    longitude: denuncia ? String(denuncia.longitude) : '',
    foto: denuncia?.foto ?? '',
    status: denuncia?.status ?? 'recebida',
  });
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const latitudeNumero = Number(form.latitude);
  const longitudeNumero = Number(form.longitude);
  const coordenadasValidas =
    form.latitude.trim() !== '' &&
    form.longitude.trim() !== '' &&
    Number.isFinite(latitudeNumero) &&
    Number.isFinite(longitudeNumero) &&
    Math.abs(latitudeNumero) <= 90 &&
    Math.abs(longitudeNumero) <= 180;

  function setCampo(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function selecionarNoMapa(novaLatitude: number, novaLongitude: number) {
    setForm((f) => ({
      ...f,
      latitude: novaLatitude.toFixed(6),
      longitude: novaLongitude.toFixed(6),
    }));
    setErros((atual) => {
      const proximos = { ...atual };
      delete proximos.latitude;
      delete proximos.longitude;
      return proximos;
    });
  }

  function validar(): DenunciaFormData | null {
    const parseLat = form.latitude.trim() === '' ? Number.NaN : Number(form.latitude);
    const parseLng = form.longitude.trim() === '' ? Number.NaN : Number(form.longitude);
    const resultado = denunciaSchema.safeParse({
      titulo: form.titulo,
      descricao: form.descricao,
      categoria: form.categoria || undefined,
      latitude: parseLat,
      longitude: parseLng,
      foto: form.foto || undefined,
    });
    if (resultado.success) return resultado.data;
    const novosErros: Erros = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as keyof DenunciaFormData;
      if (!novosErros[campo]) novosErros[campo] = issue.message;
    }
    novosErros.form = 'Verifique os campos destacados.';
    setErros(novosErros);
    return null;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    const dados = validar();
    if (!dados) return;
    setSalvando(true);
    try {
      if (denuncia) {
        await atualizarDenuncia(denuncia.id, { ...dados, status: form.status as Denuncia['status'] });
        router.push(`/denuncias/${denuncia.id}`);
      } else {
        const criada = await criarDenuncia(dados);
        router.push(`/denuncias/${criada.id}`);
      }
    } catch {
      setErros({ form: 'Nao foi possivel salvar a denuncia. Verifique se o backend esta em execucao.' });
    } finally {
      setSalvando(false);
    }
  }

  const inputClasse = (campo: keyof DenunciaFormData) =>
    `w-full border rounded-lg px-3 py-2 text-sm ${erros[campo] ? 'border-red-500' : 'border-slate-300'}`;

  return (
    <form onSubmit={enviar} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">Titulo</label>
        <input
          className={inputClasse('titulo')}
          value={form.titulo}
          onChange={(e) => setCampo('titulo', e.target.value)}
          placeholder="Ex: Buraco na Rua Principal"
        />
        {erros.titulo && <p className="text-xs text-red-600 mt-1">{erros.titulo}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descricao</label>
        <textarea
          className={inputClasse('descricao')}
          rows={4}
          value={form.descricao}
          onChange={(e) => setCampo('descricao', e.target.value)}
          placeholder="Descreva o problema com o maximo de detalhes"
        />
        {erros.descricao && <p className="text-xs text-red-600 mt-1">{erros.descricao}</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            className={inputClasse('categoria')}
            value={form.categoria}
            onChange={(e) => setCampo('categoria', e.target.value)}
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
          {erros.categoria && <p className="text-xs text-red-600 mt-1">{erros.categoria}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Latitude</label>
          <input
            className={inputClasse('latitude')}
            value={form.latitude}
            onChange={(e) => setCampo('latitude', e.target.value)}
            placeholder="-8.9016"
          />
          {erros.latitude && <p className="text-xs text-red-600 mt-1">{erros.latitude}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Longitude</label>
          <input
            className={inputClasse('longitude')}
            value={form.longitude}
            onChange={(e) => setCampo('longitude', e.target.value)}
            placeholder="-36.4926"
          />
          {erros.longitude && <p className="text-xs text-red-600 mt-1">{erros.longitude}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Localizacao no mapa</label>
        <p className="text-xs text-slate-500 mb-2">
          Clique no mapa para marcar o ponto do problema. Latitude e longitude sao preenchidas automaticamente.
        </p>
        <MapaSelecao
          latitude={coordenadasValidas ? latitudeNumero : null}
          longitude={coordenadasValidas ? longitudeNumero : null}
          onSelecionar={selecionarNoMapa}
        />
        {(erros.latitude || erros.longitude) && (
          <p className="text-xs text-red-600 mt-1">{erros.latitude || erros.longitude}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Foto (URL, opcional)</label>
          <input
            className={inputClasse('foto')}
            value={form.foto}
            onChange={(e) => setCampo('foto', e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
          />
          {erros.foto && <p className="text-xs text-red-600 mt-1">{erros.foto}</p>}
        </div>
        {denuncia && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setCampo('status', e.target.value)}
            >
              {statusLista.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {erros.form && <p className="text-sm text-red-600">{erros.form}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : denuncia ? 'Salvar alteracoes' : 'Cadastrar denuncia'}
        </button>
        <Link
          href={denuncia ? `/denuncias/${denuncia.id}` : '/denuncias'}
          className="border border-slate-300 rounded-lg px-5 py-2 text-sm hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
