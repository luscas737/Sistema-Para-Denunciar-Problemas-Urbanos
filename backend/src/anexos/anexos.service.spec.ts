import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { AnexosService, LIMITE_ANEXOS_POR_DENUNCIA } from './anexos.service';
import { Anexo } from './entities/anexo.entity';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  count: jest.fn(),
  remove: jest.fn(),
});

const denunciaBase = (extra: Record<string, unknown> = {}) => ({
  id: 'uuid-1',
  arquivada: false,
  ...extra,
});

describe('AnexosService', () => {
  let service: AnexosService;
  let anexos: ReturnType<typeof mockRepository>;
  let denuncias: ReturnType<typeof mockRepository>;

  const dto = {
    url: 'https://cdn.exemplo.com/foto.jpg',
    tipo: 'imagem' as const,
    descricao: 'Foto do buraco',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnexosService,
        { provide: getRepositoryToken(Anexo), useFactory: mockRepository },
        { provide: getRepositoryToken(Denuncia), useFactory: mockRepository },
      ],
    }).compile();

    service = moduleRef.get(AnexosService);
    anexos = moduleRef.get(getRepositoryToken(Anexo));
    denuncias = moduleRef.get(getRepositoryToken(Denuncia));
    denuncias.findOneBy.mockResolvedValue(denunciaBase());
    anexos.create.mockImplementation((dados) => dados);
    anexos.save.mockImplementation(async (dados) => ({ id: 'anexo-1', ...dados }));
    anexos.count.mockResolvedValue(0);
  });

  describe('criar', () => {
    it('cadastra o anexo na denúncia com o remetente', async () => {
      const resultado = await service.criar('uuid-1', dto, 'usuario-1');

      expect(resultado.id).toBe('anexo-1');
      expect(resultado.denunciaId).toBe('uuid-1');
      expect(resultado.enviadoPorId).toBe('usuario-1');
      expect(anexos.save).toHaveBeenCalled();
    });

    it('aceita anexo sem remetente (cabeçalho opcional)', async () => {
      const resultado = await service.criar('uuid-1', dto, null);

      expect(resultado.enviadoPorId).toBeNull();
    });

    it('lança 404 quando a denúncia não existe', async () => {
      denuncias.findOneBy.mockResolvedValue(null);

      await expect(service.criar('uuid-1', dto, null)).rejects.toThrow(NotFoundException);
      expect(anexos.save).not.toHaveBeenCalled();
    });

    it('lança 409 na denúncia arquivada (regra 4 da seção 6.3)', async () => {
      denuncias.findOneBy.mockResolvedValue(denunciaBase({ arquivada: true }));

      await expect(service.criar('uuid-1', dto, null)).rejects.toThrow(ConflictException);
      expect(anexos.save).not.toHaveBeenCalled();
    });

    it(`lança 409 ao passar de ${LIMITE_ANEXOS_POR_DENUNCIA} anexos`, async () => {
      anexos.count.mockResolvedValue(LIMITE_ANEXOS_POR_DENUNCIA);

      await expect(service.criar('uuid-1', dto, null)).rejects.toThrow(ConflictException);
      expect(anexos.save).not.toHaveBeenCalled();
    });

    it('permite anexo enquanto o limite não foi atingido', async () => {
      anexos.count.mockResolvedValue(LIMITE_ANEXOS_POR_DENUNCIA - 1);

      const resultado = await service.criar('uuid-1', dto, null);

      expect(resultado.id).toBe('anexo-1');
    });
  });

  describe('listarPorDenuncia', () => {
    it('lista os anexos da denúncia', async () => {
      anexos.find.mockResolvedValue([]);

      const resultado = await service.listarPorDenuncia('uuid-1');

      expect(anexos.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { denunciaId: 'uuid-1' } }),
      );
      expect(resultado).toEqual([]);
    });

    it('lança 404 quando a denúncia não existe', async () => {
      denuncias.findOneBy.mockResolvedValue(null);

      await expect(service.listarPorDenuncia('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remover', () => {
    it('remove o anexo da denúncia', async () => {
      const anexo = { id: 'anexo-1', denunciaId: 'uuid-1' };
      anexos.findOneBy.mockResolvedValue(anexo);
      anexos.remove.mockImplementation(async (dados) => dados);

      const resultado = await service.remover('uuid-1', 'anexo-1');

      expect(resultado.id).toBe('anexo-1');
      expect(anexos.remove).toHaveBeenCalledWith(anexo);
    });

    it('lança 404 quando o anexo pertence a outra denúncia', async () => {
      anexos.findOneBy.mockResolvedValue(null);

      await expect(service.remover('uuid-1', 'anexo-de-outra')).rejects.toThrow(
        NotFoundException,
      );
      expect(anexos.remove).not.toHaveBeenCalled();
    });
  });
});