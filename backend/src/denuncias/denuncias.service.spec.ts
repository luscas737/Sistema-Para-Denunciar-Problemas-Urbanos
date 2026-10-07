import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HISTORICO_RECORDER } from '../common/historico/historico-recorder';
import { TipoUsuario } from '../common/tipos-usuario';
import { Cidadao } from '../usuarios/entities/cidadao.entity';
import { CategoriaDenuncia, StatusDenuncia } from './denuncia.enums';
import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  count: jest.fn(),
});

const filtrosPadrao = { pagina: 1, limite: 20 } as const;

const denunciaBase = (extra: Record<string, unknown> = {}) => ({
  id: 'uuid-1',
  titulo: 'Buraco na rua principal',
  descricao: 'Existe um buraco grande em frente ao número 100.',
  categoria: CategoriaDenuncia.BURACO,
  latitude: -8.9,
  longitude: -36.6,
  status: StatusDenuncia.RECEBIDA,
  cidadaoId: null,
  setorAtualId: null,
  arquivada: false,
  arquivadaEm: null,
  ...extra,
});

describe('DenunciasService', () => {
  let service: DenunciasService;
  let denuncias: ReturnType<typeof mockRepository>;
  let cidadaos: ReturnType<typeof mockRepository>;
  let gerenciador: { save: jest.Mock; count: jest.Mock };
  let historico: { registrar: jest.Mock };

  beforeEach(async () => {
    gerenciador = {
      save: jest.fn(async (_entidade, dados) => dados),
      count: jest.fn(async () => 1),
    };
    historico = { registrar: jest.fn(async () => undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DenunciasService,
        { provide: getRepositoryToken(Denuncia), useFactory: mockRepository },
        { provide: getRepositoryToken(Cidadao), useFactory: mockRepository },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (callback) => callback(gerenciador)),
          },
        },
        { provide: HISTORICO_RECORDER, useValue: historico },
      ],
    }).compile();

    service = moduleRef.get(DenunciasService);
    denuncias = moduleRef.get(getRepositoryToken(Denuncia));
    cidadaos = moduleRef.get(getRepositoryToken(Cidadao));
  });

  describe('criação', () => {
    it('cria uma denúncia anônima com status inicial recebida', async () => {
      denuncias.create.mockImplementation((dados) => dados);
      denuncias.save.mockImplementation(async (dados) => ({ id: 'uuid-1', ...dados }));

      const resultado = await service.criar({
        titulo: 'Buraco na rua principal',
        descricao: 'Existe um buraco grande em frente ao número 100.',
        categoria: CategoriaDenuncia.BURACO,
        latitude: -8.9,
        longitude: -36.6,
      });

      expect(resultado.status).toBe(StatusDenuncia.RECEBIDA);
      expect(resultado.cidadaoId).toBeNull();
      expect(resultado.arquivada).toBe(false);
    });

    it('aceita denúncia de um cidadão ativo', async () => {
      cidadaos.count.mockResolvedValue(1);
      denuncias.create.mockImplementation((dados) => dados);
      denuncias.save.mockImplementation(async (dados) => ({ id: 'uuid-2', ...dados }));

      const resultado = await service.criar({
        titulo: 'Lixo acumulado na praça',
        descricao: 'Muito lixo acumulado há semanas na praça central.',
        categoria: CategoriaDenuncia.LIXO,
        latitude: -8.9,
        longitude: -36.6,
        cidadaoId: 'cidadao-1',
      });

      expect(resultado.cidadaoId).toBe('cidadao-1');
    });

    it('lança 400 quando o cidadão não existe ou está inativo', async () => {
      cidadaos.count.mockResolvedValue(0);

      await expect(
        service.criar({
          titulo: 'Poste queimado',
          descricao: 'Poste apagado há vários dias na rua A.',
          categoria: CategoriaDenuncia.POSTE,
          latitude: -8.9,
          longitude: -36.6,
          cidadaoId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(denuncias.save).not.toHaveBeenCalled();
    });
  });

  describe('consultas', () => {
    it('lança 404 quando a denúncia não existe', async () => {
      denuncias.findOneBy.mockResolvedValue(null);

      await expect(service.obterPorId('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('lista excluindo arquivadas por padrão e aplicando paginação', async () => {
      denuncias.findAndCount.mockResolvedValue([[], 0]);

      await service.listar({ ...filtrosPadrao, pagina: 2, limite: 10 });

      expect(denuncias.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { arquivada: false }, skip: 10, take: 10 }),
      );
    });

    it('libera as arquivadas quando arquivadas=true', async () => {
      denuncias.findAndCount.mockResolvedValue([[], 0]);

      await service.listar({ ...filtrosPadrao, arquivadas: true });

      expect(denuncias.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('combina filtros de status, categoria e setor', async () => {
      denuncias.findAndCount.mockResolvedValue([[], 0]);

      await service.listar({
        ...filtrosPadrao,
        status: StatusDenuncia.ENCAMINHADA,
        categoria: CategoriaDenuncia.BURACO,
        setor: 'setor-1',
      });

      expect(denuncias.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            arquivada: false,
            status: StatusDenuncia.ENCAMINHADA,
            categoria: CategoriaDenuncia.BURACO,
            setorAtualId: 'setor-1',
          },
        }),
      );
    });

    it('busca textual consulta título e descrição', async () => {
      denuncias.findAndCount.mockResolvedValue([[], 0]);

      await service.listar({ ...filtrosPadrao, busca: 'buraco' });

      const argumento = denuncias.findAndCount.mock.calls[0][0];
      expect(Array.isArray(argumento.where)).toBe(true);
      expect(argumento.where).toHaveLength(2);
    });
  });

  describe('arquivamento', () => {
    it('arquiva a denúncia preservando o registro', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());
      denuncias.save.mockImplementation(async (dados) => dados);

      const resultado = await service.arquivar('uuid-1');

      expect(resultado.arquivada).toBe(true);
      expect(resultado.arquivadaEm).toBeInstanceOf(Date);
      expect(denuncias.save).toHaveBeenCalled();
    });

    it('arquivar é idempotente', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ arquivada: true }));

      await service.arquivar('uuid-1');

      expect(denuncias.save).not.toHaveBeenCalled();
    });
  });

  describe('máquina de estados', () => {
    const contexto = (tipo: TipoUsuario) => ({ tipo, usuarioId: 'usuario-1' });

    it('atendente encaminha a denúncia e grava o histórico na mesma transação', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());

      const resultado = await service.alterarStatus(
        'uuid-1',
        { status: StatusDenuncia.ENCAMINHADA },
        contexto(TipoUsuario.ATENDENTE),
      );

      expect(resultado.status).toBe(StatusDenuncia.ENCAMINHADA);
      expect(historico.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          denunciaId: 'uuid-1',
          statusAnterior: StatusDenuncia.RECEBIDA,
          statusAtual: StatusDenuncia.ENCAMINHADA,
        }),
        expect.anything(),
      );
    });

    it('recusa recebida -> encaminhada sem encaminhamento registrado (409)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());
      gerenciador.count.mockResolvedValue(0);

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.ENCAMINHADA },
          contexto(TipoUsuario.ATENDENTE),
        ),
      ).rejects.toThrow(ConflictException);

      expect(historico.registrar).not.toHaveBeenCalled();
      expect(gerenciador.save).not.toHaveBeenCalled();
    });

    it('permite a transição quando um encaminhamento já existe', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());
      gerenciador.count.mockResolvedValue(2);

      const resultado = await service.alterarStatus(
        'uuid-1',
        { status: StatusDenuncia.ENCAMINHADA },
        contexto(TipoUsuario.ATENDENTE),
      );

      expect(resultado.status).toBe(StatusDenuncia.ENCAMINHADA);
    });

    it('a contagem de encaminhamentos usa o gerenciador externo quando informado', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());
      gerenciador.count.mockResolvedValue(1);

      await service.alterarStatus(
        'uuid-1',
        { status: StatusDenuncia.ENCAMINHADA },
        contexto(TipoUsuario.ATENDENTE),
        gerenciador as never,
      );

      expect(gerenciador.count).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ where: { denunciaId: 'uuid-1' } }),
      );
    });

    it('recusa salto de etapa (recebida para resolvida) com 409', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.RESOLVIDA },
          contexto(TipoUsuario.ADMINISTRADOR),
        ),
      ).rejects.toThrow(ConflictException);

      expect(historico.registrar).not.toHaveBeenCalled();
    });

    it('recusa transição a partir de status final (resolvida para em_andamento) com 409', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ status: StatusDenuncia.RESOLVIDA }));

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.EM_ANDAMENTO },
          contexto(TipoUsuario.ADMINISTRADOR),
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('recusa encaminhamento feito por cidadão com 403', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.ENCAMINHADA },
          contexto(TipoUsuario.CIDADAO),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('exige setor definido para entrar em andamento (409)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ status: StatusDenuncia.ENCAMINHADA }));

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.EM_ANDAMENTO },
          contexto(TipoUsuario.ATENDENTE),
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('permite entrar em andamento quando há setor definido', async () => {
      denuncias.findOneBy.mockResolvedValue(
        denunciaBase({ status: StatusDenuncia.ENCAMINHADA, setorAtualId: 'setor-1' }),
      );

      const resultado = await service.alterarStatus(
        'uuid-1',
        { status: StatusDenuncia.EM_ANDAMENTO },
        contexto(TipoUsuario.ATENDENTE),
      );

      expect(resultado.status).toBe(StatusDenuncia.EM_ANDAMENTO);
    });

    it('reabertura exige comentário (400)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ status: StatusDenuncia.RESOLVIDA }));

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.RECEBIDA },
          contexto(TipoUsuario.ADMINISTRADOR),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('reabertura é exclusiva do administrador (403 para atendente)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ status: StatusDenuncia.RESOLVIDA }));

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.RECEBIDA, comentario: 'Denúncia reaberta para revisão' },
          contexto(TipoUsuario.ATENDENTE),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('administrador reabre com comentário', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ status: StatusDenuncia.RESOLVIDA }));

      const resultado = await service.alterarStatus(
        'uuid-1',
        { status: StatusDenuncia.RECEBIDA, comentario: 'Denúncia reaberta para revisão' },
        contexto(TipoUsuario.ADMINISTRADOR),
      );

      expect(resultado.status).toBe(StatusDenuncia.RECEBIDA);
      expect(historico.registrar).toHaveBeenCalledWith(
        expect.objectContaining({ comentario: 'Denúncia reaberta para revisão' }),
        expect.anything(),
      );
    });

    it('denúncia arquivada não muda de status (409)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ arquivada: true }));

      await expect(
        service.alterarStatus(
          'uuid-1',
          { status: StatusDenuncia.ENCAMINHADA },
          contexto(TipoUsuario.ADMINISTRADOR),
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('alteração de dados (regra 6.3-1)', () => {
    const dto = { titulo: 'Título corrigido pelo autor' };

    it('o autor pode corrigir enquanto a denúncia está recebida', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase());
      denuncias.save.mockImplementation(async (dados) => dados);

      const resultado = await service.atualizar('uuid-1', dto, {
        tipo: TipoUsuario.CIDADAO,
        usuarioId: 'autor-1',
      });

      expect(resultado.titulo).toBe('Título corrigido pelo autor');
      expect(denuncias.save).toHaveBeenCalled();
    });

    it('cidadão não altera denúncia depois de encaminhada (409)', async () => {
      denuncias.findOneBy.mockResolvedValue(
        denunciaBase({ status: StatusDenuncia.ENCAMINHADA, setorAtualId: 'setor-1' }),
      );

      await expect(
        service.atualizar('uuid-1', dto, { tipo: TipoUsuario.CIDADAO, usuarioId: 'autor-1' }),
      ).rejects.toThrow(ConflictException);

      expect(denuncias.save).not.toHaveBeenCalled();
    });

    it('atendente altera denúncia em atendimento', async () => {
      denuncias.findOneBy.mockResolvedValue(
        denunciaBase({ status: StatusDenuncia.EM_ANDAMENTO, setorAtualId: 'setor-1' }),
      );
      denuncias.save.mockImplementation(async (dados) => dados);

      const resultado = await service.atualizar('uuid-1', dto, {
        tipo: TipoUsuario.ATENDENTE,
        usuarioId: 'atendente-1',
      });

      expect(resultado.titulo).toBe('Título corrigido pelo autor');
    });
  });
});
