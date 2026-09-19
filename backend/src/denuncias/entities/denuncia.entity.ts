import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column('varchar', { length: 500, nullable: true })
  foto: string | null;

  @Column('varchar', { length: 20, default: StatusDenuncia.RECEBIDA })
  status: StatusDenuncia;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
