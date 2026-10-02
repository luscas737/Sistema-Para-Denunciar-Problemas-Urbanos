import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cidadao } from '../../usuarios/entities/cidadao.entity';
import { CategoriaDenuncia, StatusDenuncia } from '../denuncia.enums';

@Entity('denuncias')
export class Denuncia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  titulo: string;

  @Column('varchar', { length: 1000 })
  descricao: string;

  @Column('varchar', { length: 20 })
  categoria: CategoriaDenuncia;

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

  @Column('boolean', { default: false })
  arquivada: boolean;

  @Column('datetime', { nullable: true })
  arquivadaEm: Date | null;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
