import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';
import { CategoriaDenuncia, StatusDenuncia } from './denuncia.enums';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
});

describe('DenunciasService', () => {
  let service: DenunciasService;
  let repository: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DenunciasService,
        { provide: getRepositoryToken(Denuncia), useFactory: mockRepository },
      ],
    }).compile();

    service = moduleRef.get(DenunciasService);
    repository = moduleRef.get(getRepositoryToken(Denuncia));
  });

  it('cria uma denúncia com status inicial recebida', async () => {
    const dto = {
      titulo: 'Buraco na rua principal',
      descricao: 'Existe um buraco grande em frente ao numero 100.',
      categoria: CategoriaDenuncia.BURACO,
      latitude: -8.9,
      longitude: -36.6,
      foto: null,
    };
    repository.create.mockReturnValue(dto);
    repository.save.mockResolvedValue({ id: 'uuid-1', ...dto, status: StatusDenuncia.RECEBIDA });

    const resultado = await service.criar(dto);

    expect(resultado.status).toBe(StatusDenuncia.RECEBIDA);
    expect(repository.save).toHaveBeenCalled();
  });

  it('lanca NotFoundException quando denúncia nao existe', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.obterPorId('id-inexistente')).rejects.toThrow(NotFoundException);
  });

  it('atualiza o status de uma denúncia existente', async () => {
    const existente = {
      id: 'uuid-1',
      titulo: 'Poste queimado',
      status: StatusDenuncia.RECEBIDA,
    };
    repository.findOneBy.mockResolvedValue(existente);
    repository.save.mockImplementation(async (d) => d);

    const resultado = await service.atualizar('uuid-1', { status: StatusDenuncia.EM_ANDAMENTO });

    expect(resultado.status).toBe(StatusDenuncia.EM_ANDAMENTO);
  });
});
