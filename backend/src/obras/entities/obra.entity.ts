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
import { Autor } from './autor.entity';
import { Exemplar } from './exemplar.entity';

@Entity('obras')
@Index(['autorId'])
@Index(['anoPublicacao'])
export class Obra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200, nullable: false })
  titulo: string;

  @Column('varchar', { length: 50, nullable: true })
  isbn: string | null;

  @Column('int', { nullable: true })
  anoPublicacao: number | null;

  @Column('varchar', { nullable: false })
  autorId: string;

  @ManyToOne(() => Autor, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autorId' })
  autor: Autor;

  @OneToMany(() => Exemplar, (exemplar) => exemplar.obra)
  exemplares: Exemplar[];

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}