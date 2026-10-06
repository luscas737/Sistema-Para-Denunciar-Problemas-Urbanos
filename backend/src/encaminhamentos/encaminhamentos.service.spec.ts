import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { DenunciasService } from '../denuncias/denuncias.service';
import { StatusDenuncia } from '../denuncias/denuncia.enums';
import { SetoresService } from '../setores/setores.service';
import { Administrador } from '../usuarios/entities/administrador.entity';
import { Atendente } from '../usuarios/entities/atendente.entity';
import { Encaminhamento } from './encaminhamento.entity';
import { EncaminhamentosService } from './encaminhamentos.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  count: jest.fn(),
});

const denunciaBase = (extra: Record<string, unknown> = {}) => ({
  id: 'uuid-1',
  status: StatusDenuncia.RECEBIDA,
  arquivada: false,
  setorAtualId: null,
  ...extra,
});

describe('EncaminhamentosService', () => {
  let service: EncaminhamentosService;
  let encaminhamentos: ReturnType<typeof mockRepository>;
  let atendentes: ReturnType<typeof mockRepository>;
  let administradores: ReturnType<typeof mockRepository>;
  let setores: { obterAtivoParaEncaminhamento: jest.Mock };
  let denuncias: { obterPorId: jest.Mock; alterarStatus: jest.Mock };
  let gerenciador: { create: jest.Mock; save: jest.Mock; update: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  const contexto = (usuarioId = 'atendente-1') => ({
    usuarioId,
    tipo: TipoUsuario.ATENDENTE,
  });

  beforeEach(async () => {
    gerenciador = {
      create: jest.fn((_classe, dados) => dados),
      save: jest.fn(async (_classe, dados) => ({ id: 'enc-1', ...dados })),
      update: jest.fn(async () => undefined),
    };
    dataSource = {
      transaction: jest.fn(async (callback) => callback(gerenciador)),
    };
    setores = { obterAtivoParaEncaminhamento: jest.fn(async () => ({ id: 'setor-1' })) };
    denuncias = {
      obterPorId: jest.fn(async () => denunciaBase()),
      alterarStatus: jest.fn(async () => denunciaBase({ status: StatusDenuncia.ENCAMINHADA })),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EncaminhamentosService,
        { provide: getRepositoryToken(Encaminhamento), useFactory: mockRepository },
        { provide: getRepositoryToken(Atendente), useFactory: mockRepository },
        { provide: getRepositoryToken(Administrador), useFactory: mockRepository },
        { provide: SetoresService, useValue: setores },
        { provide: DenunciasService, useValue: denuncias },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(EncaminhamentosService);
    encaminhamentos = moduleRef.get(getRepositoryToken(Encaminhamento));
    atendentes = moduleRef.get(getRepositoryToken(Atendente));
    administradores = moduleRef.get(getRepositoryToken(Administrador));
    atendentes.findOneBy.mockResolvedValue({ id: 'atendente-1', ativo: true });
    administradores.findOneBy.mockResolvedValue(null);
  });

  describe('criar', () => {
    const dto = { setorDestinoId: 'setor-1', observacao: 'Enviar para vistoria' };

    it('cria o encaminhamento, transiciona o status e define o setor na mesma transação', async () => {
      encaminhamentos.findOne.mockResolvedValue(null);

      const resultado = await service.criar('uuid-1', dto, contexto());

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(denuncias.alterarStatus).toHaveBeenCalledWith(
        'uuid-1',
        { status: StatusDenuncia.ENCAMINHADA, comentario: 'Enviar para vistoria' },
        { tipo: TipoUsuario.ATENDENTE, usuarioId: 'atendente-1' },
        gerenciador,
      );
      // setorAtualId é aplicado depois da transição para não ser sobrescrito pelo save
      expect(gerenciador.update).toHaveBeenCalledWith(
        'denuncias',
        { id: 'uuid-1' },
        { setorAtualId: 'setor-1' },
      );
      expect(resultado.id).toBe('enc-1');
      expect(resultado.enviadoPorId).toBe('atendente-1');
    });

    it('lança 400 quando o cabeçalho x-usuario-id não é informado', async () => {
      await expect(
        service.criar('uuid-1', dto, { usuarioId: '', tipo: TipoUsuario.ATENDENTE }),
      ).rejects.toThrow(BadRequestException);

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('lança 403 quando quem encaminha não é um atendente ativo', async () => {
      atendentes.findOneBy.mockResolvedValue(null);

      await expect(service.criar('uuid-1', dto, contexto('cidadao-1'))).rejects.toThrow(
        ForbiddenException,
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('lança 403 quando o atendente está inativo', async () => {
      atendentes.findOneBy.mockResolvedValue({ id: 'atendente-1', ativo: false });

      await expect(service.criar('uuid-1', dto, contexto())).rejects.toThrow(ForbiddenException);
    });

    it('aceita administrador ativo como remetente', async () => {
      atendentes.findOneBy.mockResolvedValue(null);
      administradores.findOneBy.mockResolvedValue({ id: 'admin-1', ativo: true });
      encaminhamentos.findOne.mockResolvedValue(null);

      const resultado = await service.criar('uuid-1', dto, contexto('admin-1'));

      expect(resultado.enviadoPorId).toBe('admin-1');
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('lança 403 quando o administrador está inativo', async () => {
      atendentes.findOneBy.mockResolvedValue(null);
      administradores.findOneBy.mockResolvedValue({ id: 'admin-1', ativo: false });

      await expect(service.criar('uuid-1', dto, contexto('admin-1'))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('lança 409 quando a denúncia está arquivada', async () => {
      denuncias.obterPorId.mockResolvedValue(denunciaBase({ arquivada: true }));

      await expect(service.criar('uuid-1', dto, contexto())).rejects.toThrow(ConflictException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('lança 409 quando a denúncia está resolvida (estado final)', async () => {
      denuncias.obterPorId.mockResolvedValue(denunciaBase({ status: StatusDenuncia.RESOLVIDA }));

      await expect(service.criar('uuid-1', dto, contexto())).rejects.toThrow(ConflictException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('lança 409 no reencaminhamento ao mesmo setor', async () => {
      encaminhamentos.findOne.mockResolvedValue({ id: 'enc-0' });

      await expect(service.criar('uuid-1', dto, contexto())).rejects.toThrow(ConflictException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('lança 409 quando o setor de destino está inativo', async () => {
      encaminhamentos.findOne.mockResolvedValue(null);
      setores.obterAtivoParaEncaminhamento.mockRejectedValue(
        new ConflictException('Setor inativo'),
      );

      await expect(service.criar('uuid-1', dto, contexto())).rejects.toThrow(ConflictException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('não chama a transição de status quando a denúncia já está em atendimento', async () => {
      denuncias.obterPorId.mockResolvedValue(
        denunciaBase({ status: StatusDenuncia.EM_ANDAMENTO, setorAtualId: 'setor-1' }),
      );
      encaminhamentos.findOne.mockResolvedValue(null);

      await service.criar('uuid-1', dto, contexto());

      expect(denuncias.alterarStatus).not.toHaveBeenCalled();
      expect(gerenciador.update).toHaveBeenCalled();
    });
  });

  describe('registrarAceite', () => {
    it('preenche a data de aceite', async () => {
      encaminhamentos.findOneBy.mockResolvedValue({ id: 'enc-1', aceite: null });
      encaminhamentos.save.mockImplementation(async (dados) => dados);

      const resultado = await service.registrarAceite('enc-1');

      expect(resultado.aceite).toBeInstanceOf(Date);
    });

    it('lança 409 quando o encaminhamento já foi aceito', async () => {
      encaminhamentos.findOneBy.mockResolvedValue({ id: 'enc-1', aceite: new Date() });

      await expect(service.registrarAceite('enc-1')).rejects.toThrow(ConflictException);
      expect(encaminhamentos.save).not.toHaveBeenCalled();
    });

    it('lança 404 quando o encaminhamento não existe', async () => {
      encaminhamentos.findOneBy.mockResolvedValue(null);

      await expect(service.registrarAceite('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});

