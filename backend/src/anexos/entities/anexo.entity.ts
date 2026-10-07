import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Denuncia } from '../../denuncias/entities/denuncia.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export type TipoAnexo = 'imagem' | 'documento';

@Entity('anexos')
export class Anexo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  denunciaId: string;

  /** Único CASCADE do modelo (seção 5.3): anexo não tem valor fora da denúncia. */
  @ManyToOne(() => Denuncia, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'denunciaId' })
  denuncia?: Denuncia;

  @Column('varchar', { length: 500, nullable: false })
  url: string;

  @Column('varchar', { length: 20, nullable: false })
  tipo: TipoAnexo;

  @Column('varchar', { length: 200, nullable: true })
  descricao: string | null;

  @Column('varchar', { nullable: true })
  enviadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'enviadoPorId' })
  enviadoPor?: Usuario | null;

  @CreateDateColumn()
  criadoEm: Date;
}