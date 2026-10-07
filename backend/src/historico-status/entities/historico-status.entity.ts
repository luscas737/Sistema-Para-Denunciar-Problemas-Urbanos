import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusDenuncia } from '../../denuncias/denuncia.enums';
import { Denuncia } from '../../denuncias/entities/denuncia.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('historico_status')
export class HistoricoStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  denunciaId: string;

  @ManyToOne(() => Denuncia, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'denunciaId' })
  denuncia?: Denuncia;

  /** `null` na criação da denúncia (seção 5.2). */
  @Column('varchar', { length: 20, nullable: true })
  statusAnterior: StatusDenuncia | null;

  @Column('varchar', { length: 20, nullable: false })
  statusAtual: StatusDenuncia;

  /** Qualquer tipo de usuário; `null` = sistema (seção 5.2). */
  @Column('varchar', { nullable: true })
  alteradoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'alteradoPorId' })
  alteradoPor?: Usuario | null;

  @Column('varchar', { length: 300, nullable: true })
  comentario: string | null;

  @CreateDateColumn()
  dataAlteracao: Date;
}