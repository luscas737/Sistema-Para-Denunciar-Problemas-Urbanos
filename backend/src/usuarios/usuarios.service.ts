import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { SetoresService } from '../setores/setores.service';
import { TipoUsuario } from '../common/tipos-usuario';
import {
  AtualizarAdministradorDto,
  AtualizarAtendenteDto,
  AtualizarCidadaoDto,
  CriarAdministradorDto,
  CriarAtendenteDto,
  CriarCidadaoDto,
  ListarUsuariosQueryDto,
} from './dto/usuario.dto';
import { Administrador } from './entities/administrador.entity';
import { Atendente } from './entities/atendente.entity';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Cidadao)
    private readonly cidadaos: Repository<Cidadao>,
    @InjectRepository(Atendente)
    private readonly atendentes: Repository<Atendente>,
    @InjectRepository(Administrador)
    private readonly administradores: Repository<Administrador>,
    private readonly setores: SetoresService,
  ) {}

  async criarCidadao(dto: CriarCidadaoDto): Promise<Cidadao> {
    const email = dto.email.trim().toLowerCase();
    await this.garantirEmailLivre(email);

    const cpf = dto.cpf?.trim() || null;
    if (cpf) await this.garantirCpfLivre(cpf);

    const cidadao = this.cidadaos.create({
      nome: dto.nome.trim(),
      email,
      telefone: dto.telefone?.trim() || null,
      cpf,
      bairro: dto.bairro?.trim() || null,
      ativo: true,
    });
    return this.cidadaos.save(cidadao);
  }

  async listarCidadaos(filtros: { ativo?: boolean; nome?: string } = {}): Promise<Cidadao[]> {
    return this.cidadaos.find({ where: this.montarWhere(filtros), order: { nome: 'ASC' } });
  }

  async obterCidadao(id: string): Promise<Cidadao> {
    const cidadao = await this.cidadaos.findOneBy({ id });
    if (!cidadao) {
      throw new NotFoundException(`Cidadão com id ${id} não encontrado.`);
    }
    return cidadao;
  }

  async atualizarCidadao(id: string, dto: AtualizarCidadaoDto): Promise<Cidadao> {
    const cidadao = await this.obterCidadao(id);

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== cidadao.email) await this.garantirEmailLivre(email);
      cidadao.email = email;
    }

    if (dto.cpf !== undefined) {
      const cpf = dto.cpf?.trim() || null;
      if (cpf && cpf !== cidadao.cpf) await this.garantirCpfLivre(cpf);
      cidadao.cpf = cpf;
    }

    if (dto.nome !== undefined) cidadao.nome = dto.nome.trim();
    if (dto.telefone !== undefined) cidadao.telefone = dto.telefone?.trim() || null;
    if (dto.bairro !== undefined) cidadao.bairro = dto.bairro?.trim() || null;
    if (dto.ativo !== undefined) cidadao.ativo = dto.ativo;

    return this.cidadaos.save(cidadao);
  }

  async desativarCidadao(id: string): Promise<Cidadao> {
    const cidadao = await this.obterCidadao(id);
    cidadao.ativo = false;
    return this.cidadaos.save(cidadao);
  }

  async criarAtendente(dto: CriarAtendenteDto): Promise<Atendente> {
    const email = dto.email.trim().toLowerCase();
    await this.garantirEmailLivre(email);

    const matricula = dto.matricula?.trim() || null;
    if (matricula) await this.garantirMatriculaLivre(matricula);

    const setorId = dto.setorId ?? null;
    if (setorId) await this.setores.obterPorId(setorId);

    const atendente = this.atendentes.create({
      nome: dto.nome.trim(),
      email,
      telefone: dto.telefone?.trim() || null,
      matricula,
      setorId,
      ativo: true,
    });
    return this.atendentes.save(atendente);
  }

  async listarAtendentes(filtros: { ativo?: boolean; nome?: string } = {}): Promise<Atendente[]> {
    return this.atendentes.find({ where: this.montarWhere(filtros), order: { nome: 'ASC' } });
  }

  async obterAtendente(id: string): Promise<Atendente> {
    const atendente = await this.atendentes.findOneBy({ id });
    if (!atendente) {
      throw new NotFoundException(`Atendente com id ${id} não encontrado.`);
    }
    return atendente;
  }

  async atualizarAtendente(id: string, dto: AtualizarAtendenteDto): Promise<Atendente> {
    const atendente = await this.obterAtendente(id);

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== atendente.email) await this.garantirEmailLivre(email);
      atendente.email = email;
    }

    if (dto.matricula !== undefined) {
      const matricula = dto.matricula?.trim() || null;
      if (matricula && matricula !== atendente.matricula) {
        await this.garantirMatriculaLivre(matricula);
      }
      atendente.matricula = matricula;
    }

    if (dto.setorId !== undefined) {
      const setorId = dto.setorId ?? null;
      if (setorId) await this.setores.obterPorId(setorId);
      atendente.setorId = setorId;
    }

    if (dto.nome !== undefined) atendente.nome = dto.nome.trim();
    if (dto.telefone !== undefined) atendente.telefone = dto.telefone?.trim() || null;
    if (dto.ativo !== undefined) atendente.ativo = dto.ativo;

    return this.atendentes.save(atendente);
  }

  async desativarAtendente(id: string): Promise<Atendente> {
    const atendente = await this.obterAtendente(id);
    atendente.ativo = false;
    return this.atendentes.save(atendente);
  }

  async criarAdministrador(dto: CriarAdministradorDto): Promise<Administrador> {
    const email = dto.email.trim().toLowerCase();
    await this.garantirEmailLivre(email);

    const administrador = this.administradores.create({
      nome: dto.nome.trim(),
      email,
      telefone: dto.telefone?.trim() || null,
      nivelAcesso: dto.nivelAcesso ?? 1,
      ativo: true,
    });
    return this.administradores.save(administrador);
  }

  async listarAdministradores(filtros: { ativo?: boolean; nome?: string } = {}): Promise<Administrador[]> {
    return this.administradores.find({ where: this.montarWhere(filtros), order: { nome: 'ASC' } });
  }

  async obterAdministrador(id: string): Promise<Administrador> {
    const administrador = await this.administradores.findOneBy({ id });
    if (!administrador) {
      throw new NotFoundException(`Administrador com id ${id} não encontrado.`);
    }
    return administrador;
  }

  async atualizarAdministrador(id: string, dto: AtualizarAdministradorDto): Promise<Administrador> {
    const administrador = await this.obterAdministrador(id);

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== administrador.email) await this.garantirEmailLivre(email);
      administrador.email = email;
    }

    if (dto.nome !== undefined) administrador.nome = dto.nome.trim();
    if (dto.telefone !== undefined) administrador.telefone = dto.telefone?.trim() || null;
    if (dto.nivelAcesso !== undefined) administrador.nivelAcesso = dto.nivelAcesso;
    if (dto.ativo !== undefined) administrador.ativo = dto.ativo;

    return this.administradores.save(administrador);
  }

  async desativarAdministrador(id: string): Promise<Administrador> {
    const administrador = await this.obterAdministrador(id);
    administrador.ativo = false;
    return this.administradores.save(administrador);
  }

  async listar(filtros: ListarUsuariosQueryDto): Promise<Usuario[]> {
    const where = this.montarWhere(filtros);
    if (filtros.tipo === TipoUsuario.CIDADAO) {
      return this.cidadaos.find({ where, order: { nome: 'ASC' } });
    }
    if (filtros.tipo === TipoUsuario.ATENDENTE) {
      return this.atendentes.find({ where, order: { nome: 'ASC' } });
    }
    if (filtros.tipo === TipoUsuario.ADMINISTRADOR) {
      return this.administradores.find({ where, order: { nome: 'ASC' } });
    }
    return this.usuarios.find({ where, order: { nome: 'ASC' } });
  }

  async obterPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarios.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
    }
    return usuario;
  }

  private montarWhere(filtros: { ativo?: boolean; nome?: string }): FindOptionsWhere<Usuario> {
    const where: FindOptionsWhere<Usuario> = {};
    if (filtros.ativo !== undefined) where.ativo = filtros.ativo;
    if (filtros.nome) where.nome = Like(`%${filtros.nome}%`);
    return where;
  }

  private async garantirEmailLivre(email: string): Promise<void> {
    const existentes = await this.usuarios.count({ where: { email } });
    if (existentes > 0) {
      throw new ConflictException(`Já existe um usuário com o e-mail ${email}.`);
    }
  }

  private async garantirCpfLivre(cpf: string): Promise<void> {
    const existentes = await this.cidadaos.count({ where: { cpf } });
    if (existentes > 0) {
      throw new ConflictException(`Já existe um usuário com o CPF ${cpf}.`);
    }
  }

  private async garantirMatriculaLivre(matricula: string): Promise<void> {
    const existentes = await this.atendentes.count({ where: { matricula } });
    if (existentes > 0) {
      throw new ConflictException(`Já existe um atendente com a matrícula ${matricula}.`);
    }
  }
}
