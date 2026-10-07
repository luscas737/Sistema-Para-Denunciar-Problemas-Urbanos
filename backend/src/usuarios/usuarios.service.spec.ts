import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { SetoresService } from '../setores/setores.service';
import { Administrador } from './entities/administrador.entity';
import { Atendente } from './entities/atendente.entity';
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

const mockSetoresService = () => ({ obterPorId: jest.fn() });

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarios: ReturnType<typeof mockRepository>;
  let cidadaos: ReturnType<typeof mockRepository>;
  let atendentes: ReturnType<typeof mockRepository>;
  let administradores: ReturnType<typeof mockRepository>;
  let setores: ReturnType<typeof mockSetoresService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getRepositoryToken(Usuario), useFactory: mockRepository },
        { provide: getRepositoryToken(Cidadao), useFactory: mockRepository },
        { provide: getRepositoryToken(Atendente), useFactory: mockRepository },
        { provide: getRepositoryToken(Administrador), useFactory: mockRepository },
        { provide: SetoresService, useFactory: mockSetoresService },
      ],
    }).compile();

    service = moduleRef.get(UsuariosService);
    usuarios = moduleRef.get(getRepositoryToken(Usuario));
    cidadaos = moduleRef.get(getRepositoryToken(Cidadao));
    atendentes = moduleRef.get(getRepositoryToken(Atendente));
    administradores = moduleRef.get(getRepositoryToken(Administrador));
    setores = moduleRef.get(SetoresService);
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

  it('lista atendentes pelo repositório do subtipo', async () => {
    atendentes.find.mockResolvedValue([]);

    const resultado = await service.listar({ tipo: TipoUsuario.ATENDENTE });

    expect(atendentes.find).toHaveBeenCalled();
    expect(usuarios.find).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });

  it('lista administradores pelo repositório do subtipo', async () => {
    administradores.find.mockResolvedValue([]);

    const resultado = await service.listar({ tipo: TipoUsuario.ADMINISTRADOR });

    expect(administradores.find).toHaveBeenCalled();
    expect(usuarios.find).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });

  describe('administradores', () => {
    it('cadastra um administrador com nível de acesso padrão 1', async () => {
      usuarios.count.mockResolvedValue(0);
      administradores.create.mockImplementation((dados) => dados);
      administradores.save.mockImplementation(async (dados) => ({ id: 'uuid-3', ...dados }));

      const resultado = await service.criarAdministrador({
        nome: 'Paula Reis',
        email: 'PAULA@Exemplo.com',
        telefone: null,
      });

      expect(resultado.email).toBe('paula@exemplo.com');
      expect(resultado.nivelAcesso).toBe(1);
      expect(resultado.ativo).toBe(true);
      expect(administradores.save).toHaveBeenCalled();
    });

    it('aceita nível de acesso 2 (reabertura de denúncia resolvida)', async () => {
      usuarios.count.mockResolvedValue(0);
      administradores.create.mockImplementation((dados) => dados);
      administradores.save.mockImplementation(async (dados) => ({ id: 'uuid-3', ...dados }));

      const resultado = await service.criarAdministrador({
        nome: 'Paula Reis',
        email: 'paula@exemplo.com',
        nivelAcesso: 2,
      });

      expect(resultado.nivelAcesso).toBe(2);
    });

    it('lança 404 quando o administrador não existe', async () => {
      administradores.findOneBy.mockResolvedValue(null);

      await expect(service.obterAdministrador('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('desativa o administrador sem excluir o registro', async () => {
      administradores.findOneBy.mockResolvedValue({
        id: 'uuid-3',
        nome: 'Paula',
        ativo: true,
        nivelAcesso: 1,
      });
      administradores.save.mockImplementation(async (dados) => dados);

      const resultado = await service.desativarAdministrador('uuid-3');

      expect(resultado.ativo).toBe(false);
      expect(administradores.save).toHaveBeenCalled();
    });
  });

  describe('atendentes', () => {
    it('cadastra um atendente ativo validando o setor de lotação', async () => {
      usuarios.count.mockResolvedValue(0);
      atendentes.count.mockResolvedValue(0);
      setores.obterPorId.mockResolvedValue({ id: 'setor-1', nome: 'Obras' });
      atendentes.create.mockImplementation((dados) => dados);
      atendentes.save.mockImplementation(async (dados) => ({ id: 'uuid-2', ...dados }));

      const resultado = await service.criarAtendente({
        nome: 'Carlos Lima',
        email: 'CARLOS@Exemplo.com',
        telefone: null,
        matricula: '12345',
        setorId: 'setor-1',
      });

      expect(resultado.email).toBe('carlos@exemplo.com');
      expect(resultado.ativo).toBe(true);
      expect(resultado.setorId).toBe('setor-1');
      expect(setores.obterPorId).toHaveBeenCalledWith('setor-1');
      expect(atendentes.save).toHaveBeenCalled();
    });

    it('lança 404 quando o setor de lotação não existe', async () => {
      usuarios.count.mockResolvedValue(0);
      atendentes.count.mockResolvedValue(0);
      setores.obterPorId.mockRejectedValue(new NotFoundException('Setor não encontrado'));

      await expect(
        service.criarAtendente({
          nome: 'Carlos Lima',
          email: 'carlos@exemplo.com',
          setorId: 'setor-inexistente',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(atendentes.save).not.toHaveBeenCalled();
    });

    it('lança 409 quando a matrícula já existe', async () => {
      usuarios.count.mockResolvedValue(0);
      atendentes.count.mockResolvedValue(1);

      await expect(
        service.criarAtendente({ nome: 'Ana', email: 'ana@exemplo.com', matricula: '12345' }),
      ).rejects.toThrow(ConflictException);
      expect(atendentes.save).not.toHaveBeenCalled();
    });

    it('lança 404 quando o atendente não existe', async () => {
      atendentes.findOneBy.mockResolvedValue(null);

      await expect(service.obterAtendente('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('desativa o atendente sem excluir o registro', async () => {
      atendentes.findOneBy.mockResolvedValue({ id: 'uuid-2', nome: 'Carlos', ativo: true });
      atendentes.save.mockImplementation(async (dados) => dados);

      const resultado = await service.desativarAtendente('uuid-2');

      expect(resultado.ativo).toBe(false);
      expect(atendentes.save).toHaveBeenCalled();
    });
  });
});
