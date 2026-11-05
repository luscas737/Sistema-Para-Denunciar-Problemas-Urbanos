import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Denuncia } from './denuncia.entity';
import { Categoria } from './categoria.entity';

@Entity('denuncias_categorias')
@Unique('UQ_denuncia_categoria', ['denunciaId', 'categoriaId'])
export class DenunciaCategoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  denunciaId: string;

  @ManyToOne(() => Denuncia, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'denunciaId' })
  denuncia?: Denuncia;

  @Column('varchar', { nullable: false })
  categoriaId: string;

  @ManyToOne(() => Categoria, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoriaId' })
  categoria?: Categoria;

  /** Data em que a categoria foi vinculada à denúncia. */
  @CreateDateColumn()
  dataVinculacao: Date;

  /** Indica se esta é a categoria principal da denúncia (para exibição). */
  @Column('boolean', { default: false })
  ehPrincipal: boolean;
}
