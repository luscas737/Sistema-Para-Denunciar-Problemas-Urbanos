import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DenunciasService,
        { provide: getRepositoryToken(Denuncia), useFactory: mockRepository },
        { provide: getRepositoryToken(Cidadao), useFactory: mockRepository },
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

});
