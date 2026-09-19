import { z } from 'zod';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type Categoria = 'buraco' | 'poste' | 'lixo' | 'agua' | 'outros';
export type Status = 'recebida' | 'encaminhada' | 'em_andamento' | 'resolvida';

export interface Denuncia {
  id: string;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  latitude: number;
  longitude: number;
  foto: string | null;
  status: Status;
  criadoEm: string;
  atualizadoEm: string;
}

export const categorias: { valor: Categoria; rotulo: string }[] = [
  { valor: 'buraco', rotulo: 'Buraco na via' },
  { valor: 'poste', rotulo: 'Poste queimado ou danificado' },
  { valor: 'lixo', rotulo: 'Lixo acumulado' },
  { valor: 'agua', rotulo: 'Problema de agua ou esgoto' },
  { valor: 'outros', rotulo: 'Outros' },
];

export const statusLista: { valor: Status; rotulo: string }[] = [
  { valor: 'recebida', rotulo: 'Recebida' },
  { valor: 'encaminhada', rotulo: 'Encaminhada' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'resolvida', rotulo: 'Resolvida' },
];

export type DenunciaResumo = Pick<Denuncia, 'id' | 'titulo' | 'categoria' | 'status' | 'latitude' | 'longitude'>;

export const denunciaSchema = z.object({
  titulo: z.string().min(5, 'O titulo deve ter entre 5 e 100 caracteres').max(100, 'O titulo deve ter entre 5 e 100 caracteres'),
  descricao: z.string().min(10, 'A descricao deve ter entre 10 e 1000 caracteres').max(1000, 'A descricao deve ter entre 10 e 1000 caracteres'),
  categoria: z.enum(['buraco', 'poste', 'lixo', 'agua', 'outros'], { message: 'Selecione uma categoria' }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  foto: z.string().url('Informe uma URL valida').optional().or(z.literal('')),
});

export type DenunciaFormData = z.infer<typeof denunciaSchema>;

export async function listarDenuncias(filtros?: { categoria?: string; status?: string }): Promise<Denuncia[]> {
  const params = new URLSearchParams();
  if (filtros?.categoria) params.set('categoria', filtros.categoria);
  if (filtros?.status) params.set('status', filtros.status);
  const query = params.toString();
  const resposta = await fetch(`${API_URL}/denuncias${query ? `?${query}` : ''}`, { cache: 'no-store' });
  if (!resposta.ok) throw new Error('Falha ao carregar denuncias');
  return resposta.json();
}

export async function obterDenuncia(id: string): Promise<Denuncia> {
  const resposta = await fetch(`${API_URL}/denuncias/${id}`, { cache: 'no-store' });
  if (!resposta.ok) throw new Error('Falha ao carregar denuncia');
  return resposta.json();
}

export async function criarDenuncia(dados: DenunciaFormData): Promise<Denuncia> {
  const resposta = await fetch(`${API_URL}/denuncias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dados, foto: dados.foto || null }),
  });
  if (!resposta.ok) throw new Error('Falha ao cadastrar denuncia');
  return resposta.json();
}

export async function atualizarDenuncia(id: string, dados: Partial<DenunciaFormData> & { status?: Status }): Promise<Denuncia> {
  const resposta = await fetch(`${API_URL}/denuncias/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dados, foto: dados.foto || null }),
  });
  if (!resposta.ok) throw new Error('Falha ao atualizar denuncia');
  return resposta.json();
}

export async function removerDenuncia(id: string): Promise<void> {
  const resposta = await fetch(`${API_URL}/denuncias/${id}`, { method: 'DELETE' });
  if (!resposta.ok) throw new Error('Falha ao remover denuncia');
}
