import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { TipoUsuario } from '../../common/tipos-usuario';

/**
 * Base da hierarquia de usuários (decisão D1 — herança de tabela única).
 * Todos os tipos compartilham a tabela `usuarios`; a coluna `tipo` é o discriminador.
 * A P2 acrescenta o subtipo `Atendente` e a P3 o subtipo `Administrador`.
 */
@Entity('usuarios')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 120 })
  nome: string;

  @Column('varchar', { length: 160 })
  email: string;

  @Column('varchar', { length: 20, nullable: true })
  telefone: string | null;

  @Column('boolean', { default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
