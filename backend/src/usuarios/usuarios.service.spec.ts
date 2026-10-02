import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  count: jest.fn(),
});

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarios: ReturnType<typeof mockRepository>;
  let cidadaos: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useFactory: mockRepository },
        { provide: getRepositoryToken(Cidadao), useFactory: mockRepository },
      ],
    }).compile();

    service = moduleRef.get(UsuariosService);
    usuarios = moduleRef.get(getRepositoryToken(Usuario));
    cidadaos = moduleRef.get(getRepositoryToken(Cidadao));
  });

  it('cadastra um cidadão ativo normalizando o e-mail', async () => {
    usuarios.count.mockResolvedValue(0);
    cidadaos.create.mockImplementation((dados) => dados);
    cidadaos.save.mockImplementation(async (dados) => ({ id: 'uuid-1', ...dados }));

    const resultado = await service.criarCidadao({
      nome: 'Ana Souza',
      email: 'ANA@Exemplo.com ',
      telefone: null,
      cpf: null,
      bairro: null,
    });

    expect(resultado.email).toBe('ana@exemplo.com');
    expect(resultado.ativo).toBe(true);
    expect(cidadaos.save).toHaveBeenCalled();
  });

  it('lança 409 quando o e-mail já existe', async () => {
    usuarios.count.mockResolvedValue(1);

    await expect(
      service.criarCidadao({ nome: 'Ana', email: 'ana@exemplo.com' }),
    ).rejects.toThrow(ConflictException);
    expect(cidadaos.save).not.toHaveBeenCalled();
  });

  it('lança 409 quando o CPF já existe', async () => {
    usuarios.count.mockResolvedValue(0);
    cidadaos.count.mockResolvedValue(1);

    await expect(
      service.criarCidadao({
        nome: 'Ana',
        email: 'ana@exemplo.com',
        cpf: '000.000.000-00',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('lança 404 quando o cidadão não existe', async () => {
    cidadaos.findOneBy.mockResolvedValue(null);

    await expect(service.obterCidadao('id-inexistente')).rejects.toThrow(NotFoundException);
  });

  it('desativa o cidadão sem excluir o registro', async () => {
    const existente = { id: 'uuid-1', nome: 'Ana', ativo: true };
    cidadaos.findOneBy.mockResolvedValue(existente);
    cidadaos.save.mockImplementation(async (dados) => dados);

    const resultado = await service.desativarCidadao('uuid-1');

    expect(resultado.ativo).toBe(false);
    expect(cidadaos.save).toHaveBeenCalled();
  });

  it('filtra pelo repositório do subtipo quando o tipo é informado', async () => {
    cidadaos.find.mockResolvedValue([]);

    await service.listar({ tipo: TipoUsuario.CIDADAO });

    expect(cidadaos.find).toHaveBeenCalled();
    expect(usuarios.find).not.toHaveBeenCalled();
  });

  it('ainda não devolve atendentes/administradores (depende da P2/P3)', async () => {
    const resultado = await service.listar({ tipo: TipoUsuario.ATENDENTE });

    expect(resultado).toEqual([]);
    expect(usuarios.find).not.toHaveBeenCalled();
  });
});
