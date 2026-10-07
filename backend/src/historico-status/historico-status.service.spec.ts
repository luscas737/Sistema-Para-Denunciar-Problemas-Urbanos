import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Anexo } from '../anexos/entities/anexo.entity';
import { StatusDenuncia } from '../denuncias/denuncia.enums';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { Encaminhamento } from '../encaminhamentos/encaminhamento.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { HistoricoStatusService } from './historico-status.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
});

describe('HistoricoStatusService', () => {
  let service: HistoricoStatusService;
  let historicos: ReturnType<typeof mockRepository>;
  let denuncias: ReturnType<typeof mockRepository>;
  let encaminhamentos: ReturnType<typeof mockRepository>;
  let anexos: ReturnType<typeof mockRepository>;
  let gerenciador: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    gerenciador = {
      create: jest.fn((_classe, dados) => dados),
      save: jest.fn(async (_classe, dados) => ({ id: 'hist-1', ...dados })),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        HistoricoStatusService,
        { provide: getRepositoryToken(HistoricoStatus), useFactory: mockRepository },
        { provide: getRepositoryToken(Denuncia), useFactory: mockRepository },
        { provide: getRepositoryToken(Encaminhamento), useFactory: mockRepository },
        { provide: getRepositoryToken(Anexo), useFactory: mockRepository },
      ],
    }).compile();

    service = moduleRef.get(HistoricoStatusService);
    historicos = moduleRef.get(getRepositoryToken(HistoricoStatus));
    denuncias = moduleRef.get(getRepositoryToken(Denuncia));
    encaminhamentos = moduleRef.get(getRepositoryToken(Encaminhamento));
    anexos = moduleRef.get(getRepositoryToken(Anexo));
    denuncias.findOneBy.mockResolvedValue({ id: 'uuid-1', status: StatusDenuncia.RECEBIDA });
    historicos.create.mockImplementation((dados) => dados);
    historicos.save.mockImplementation(async (dados) => ({ id: 'hist-1', ...dados }));
  });

  describe('registrar', () => {
    it('grava a linha inicial da denúncia (statusAnterior null) sem gerenciador', async () => {
      await service.registrar({
        denunciaId: 'uuid-1',
        statusAnterior: null,
        statusAtual: StatusDenuncia.RECEBIDA,
        alteradoPorId: 'cidadao-1',
      });

      expect(historicos.save).toHaveBeenCalledWith(
        expect.objectContaining({
          denunciaId: 'uuid-1',
          statusAnterior: null,
          statusAtual: StatusDenuncia.RECEBIDA,
        }),
      );
    });

    it('usa o gerenciador da transação quando informado (D7)', async () => {
      await service.registrar(
        {
          denunciaId: 'uuid-1',
          statusAnterior: StatusDenuncia.RECEBIDA,
          statusAtual: StatusDenuncia.ENCAMINHADA,
          alteradoPorId: 'atendente-1',
        },
        gerenciador as never,
      );

      expect(gerenciador.save).toHaveBeenCalledWith(
        HistoricoStatus,
        expect.objectContaining({ statusAtual: StatusDenuncia.ENCAMINHADA }),
      );
      expect(historicos.save).not.toHaveBeenCalled();
    });

    it('recusa registro sem mudança real de status (400)', async () => {
      await expect(
        service.registrar({
          denunciaId: 'uuid-1',
          statusAnterior: StatusDenuncia.RECEBIDA,
          statusAtual: StatusDenuncia.RECEBIDA,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(historicos.save).not.toHaveBeenCalled();
    });
  });

  describe('listarPorDenuncia', () => {
    it('lista o histórico ordenado por data crescente', async () => {
      historicos.find.mockResolvedValue([]);

      const resultado = await service.listarPorDenuncia('uuid-1');

      expect(historicos.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { denunciaId: 'uuid-1' },
          order: { dataAlteracao: 'ASC' },
        }),
      );
      expect(resultado).toEqual([]);
    });

    it('lança 404 quando a denúncia não existe', async () => {
      denuncias.findOneBy.mockResolvedValue(null);

      await expect(service.listarPorDenuncia('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('linhaDoTempo', () => {
    it('junta histórico, encaminhamentos e anexos em ordem cronológica (D8)', async () => {
      historicos.find.mockResolvedValue([
        {
          id: 'h1',
          denunciaId: 'uuid-1',
          statusAnterior: null,
          statusAtual: StatusDenuncia.RECEBIDA,
          alteradoPorId: 'cidadao-1',
          alteradoPor: { id: 'cidadao-1' },
          comentario: null,
          dataAlteracao: new Date('2026-01-01T10:00:00Z'),
        },
        {
          id: 'h2',
          denunciaId: 'uuid-1',
          statusAnterior: StatusDenuncia.RECEBIDA,
          statusAtual: StatusDenuncia.ENCAMINHADA,
          alteradoPorId: 'atendente-1',
          alteradoPor: { id: 'atendente-1' },
          comentario: null,
          dataAlteracao: new Date('2026-01-03T10:00:00Z'),
        },
      ]);
      encaminhamentos.find.mockResolvedValue([
        {
          id: 'e1',
          denunciaId: 'uuid-1',
          dataEncaminhamento: new Date('2026-01-02T10:00:00Z'),
          setorDestino: { nome: 'Obras' },
          enviadoPor: { id: 'atendente-1' },
          observacao: 'Encaminhado para vistoria.',
        },
      ]);
      anexos.find.mockResolvedValue([
        {
          id: 'a1',
          denunciaId: 'uuid-1',
          criadoEm: new Date('2026-01-04T10:00:00Z'),
          url: 'https://cdn.exemplo.com/foto.jpg',
          descricao: 'Foto do buraco',
          enviadoPor: { id: 'cidadao-1' },
        },
      ]);

      const resultado = await service.linhaDoTempo('uuid-1');

      expect(resultado.denunciaId).toBe('uuid-1');
      expect(resultado.statusAtual).toBe(StatusDenuncia.RECEBIDA);
      expect(resultado.eventos.map((e) => e.tipo)).toEqual([
        'status',
        'encaminhamento',
        'status',
        'anexo',
      ]);
      expect(resultado.eventos[1]).toEqual(
        expect.objectContaining({
          tipo: 'encaminhamento',
          setor: 'Obras',
          observacao: 'Encaminhado para vistoria.',
        }),
      );
      const datas = resultado.eventos.map((e) => e.em.getTime());
      expect(datas).toEqual([...datas].sort((a, b) => a - b));
    });

    it('lança 404 quando a denúncia não existe', async () => {
      denuncias.findOneBy.mockResolvedValue(null);

      await expect(service.linhaDoTempo('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});

