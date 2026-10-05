import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Denuncia } from '../denuncias/entities/denuncia.entity';

@Entity('setores')
export class Setor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 120, unique: true })
  nome: string;

  @Column('varchar', { length: 300, nullable: true })
  descricao: string | null;

  @Column('varchar', { length: 160, nullable: true })
  email: string | null;

  @Column('boolean', { default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToMany(() => Denuncia, (d) => d.setorAtual)
  denunciasAtuais: Denuncia[];
}
