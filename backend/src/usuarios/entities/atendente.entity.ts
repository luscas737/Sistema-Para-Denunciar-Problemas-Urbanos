import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Setor } from '../../setores/setores.entity';
import { Usuario } from './usuario.entity';

@ChildEntity('atendente')
export class Atendente extends Usuario {
  @Column('varchar', { length: 20, nullable: true })
  matricula: string | null;

  @Column('varchar', { nullable: true })
  setorId: string | null;

  @ManyToOne(() => Setor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'setorId' })
  setor?: Setor | null;
}