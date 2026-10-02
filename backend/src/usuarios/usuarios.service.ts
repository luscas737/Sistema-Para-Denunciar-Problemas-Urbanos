import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { AtualizarCidadaoDto, CriarCidadaoDto, ListarUsuariosQueryDto } from './dto/usuario.dto';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Cidadao)
    private readonly cidadaos: Repository<Cidadao>,
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

  /** Regra da seção 6.4: usuário não é excluído, é desativado. */
  async desativarCidadao(id: string): Promise<Cidadao> {
    const cidadao = await this.obterCidadao(id);
    cidadao.ativo = false;
    return this.cidadaos.save(cidadao);
  }

  /** Listagem polimórfica de usuários (qualquer tipo). */
  async listar(filtros: ListarUsuariosQueryDto): Promise<Usuario[]> {
    const where = this.montarWhere(filtros);
    if (filtros.tipo === TipoUsuario.CIDADAO) {
      return this.cidadaos.find({ where, order: { nome: 'ASC' } });
    }
    if (filtros.tipo) {
      // P2/P3: acrescentar os ramos de Atendente e Administrador.
      return [];
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
}
