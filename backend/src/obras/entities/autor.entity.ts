import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Obra } from './obra.entity';

@Entity('autores')
export class Autor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 120, nullable: false })
  nome: string;

  @Column('varchar', { length: 100, nullable: true })
  nacionalidade: string | null;

  @Column('date', { nullable: true })
  nascimento: Date | null;

  @Column('date', { nullable: true })
  falecimento: Date | null;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToMany(() => Obra, (obra) => obra.autor)
  obras: Obra[];
}
