import { TipoUsuario } from '../common/tipos-usuario';
import { StatusDenuncia } from './denuncia.enums';

export interface Transicao {
  de: StatusDenuncia;
  para: StatusDenuncia;
  tiposPermitidos: TipoUsuario[];
  exigeComentario: boolean;
  exigeSetorAtual: boolean;
  descricao: string;
}

/** Fonte da verdade do fluxo de status (seção 6.2 do plano de trabalho). */
export const TRANSICOES: Transicao[] = [
  {
    de: StatusDenuncia.RECEBIDA,
    para: StatusDenuncia.ENCAMINHADA,
    tiposPermitidos: [TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR],
    exigeComentario: false,
    exigeSetorAtual: false,
    descricao: 'Encaminhar a denúncia ao setor responsável',
  },
  {
    de: StatusDenuncia.ENCAMINHADA,
    para: StatusDenuncia.EM_ANDAMENTO,
    tiposPermitidos: [TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR],
    exigeComentario: false,
    exigeSetorAtual: true,
    descricao: 'Iniciar o atendimento no setor',
  },
  {
    de: StatusDenuncia.EM_ANDAMENTO,
    para: StatusDenuncia.RESOLVIDA,
    tiposPermitidos: [TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR],
    exigeComentario: false,
    exigeSetorAtual: false,
    descricao: 'Concluir o atendimento',
  },
  {
    de: StatusDenuncia.RESOLVIDA,
    para: StatusDenuncia.RECEBIDA,
    tiposPermitidos: [TipoUsuario.ADMINISTRADOR],
    exigeComentario: true,
    exigeSetorAtual: false,
    descricao: 'Reabrir a denúncia (somente administrador, com comentário)',
  },
];

export function localizarTransicao(
  de: StatusDenuncia,
  para: StatusDenuncia,
): Transicao | undefined {
  return TRANSICOES.find((transicao) => transicao.de === de && transicao.para === para);
}

export function transicoesPossiveis(de: StatusDenuncia): StatusDenuncia[] {
  return TRANSICOES.filter((transicao) => transicao.de === de).map((transicao) => transicao.para);
}
