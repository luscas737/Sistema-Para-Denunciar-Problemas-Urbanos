import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Setor } from '../../setores/setores.entity';
import { Cidadao } from '../../usuarios/entities/cidadao.entity';
import { StatusDenuncia } from '../denuncia.enums';
import { DenunciaCategoria } from './denuncia-categoria.entity';

@Entity('denuncias')
@Index(['categoria', 'status'])
@Index(['setorAtualId', 'status'])
export class Denuncia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  titulo: string;

  @Column('varchar', { length: 1000 })
  descricao: string;

  @Column('varchar', { length: 20 })
  categoria: string;

  @Column('real')
  latitude: number;

  @Column('real')
  longitude: number;

  @Column('varchar', { length: 20, default: StatusDenuncia.RECEBIDA })
  status: StatusDenuncia;

  @Column('varchar', { nullable: true })
  cidadaoId: string | null;

  @ManyToOne(() => Cidadao, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cidadaoId' })
  cidadao?: Cidadao | null;

  @Column('varchar', { nullable: true })
  setorAtualId: string | null;

  @ManyToOne(() => Setor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'setorAtualId' })
  setorAtual?: Setor | null;                                           

  @Column('boolean', { default: false })
  arquivada: boolean;

  @Column('datetime', { nullable: true })
  arquivadaEm: Date | null;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToMany(() => DenunciaCategoria, (dc) => dc.denuncia)
  categorias: DenunciaCategoria[];
}
