import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Obra } from './obra.entity';

export enum EstadoExemplar {
  DISPONIVEL = 'DISPONIVEL',
  EMPRESTADO = 'EMPRESTADO',
  DESGASTADO = 'DESGASTADO',
  DESCARTADO = 'DESCARTADO',
}

@Entity('exemplares')
@Index(['obraId'])
@Index(['estado'])
export class Exemplar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, nullable: false })
  tombo: string;

  @Column('varchar', { length: 20, nullable: false })
  estado: EstadoExemplar;

  @Column('varchar', { nullable: false })
  obraId: string;

  @Column('datetime', { nullable: true })
  dataAquisicao: Date | null;

  @ManyToOne(() => Obra, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obraId' })
  obra: Obra;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}