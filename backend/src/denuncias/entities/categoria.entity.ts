import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DenunciaCategoria } from './denuncia-categoria.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  nome: string;

  @Column('varchar', { length: 300, nullable: true })
  descricao: string | null;

  @Column('boolean', { default: true })
  ativo: boolean;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @OneToMany(() => DenunciaCategoria, (dc) => dc.categoria)
  denuncias: DenunciaCategoria[];
}
