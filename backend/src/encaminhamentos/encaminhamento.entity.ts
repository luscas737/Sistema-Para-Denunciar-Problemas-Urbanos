import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { Setor } from '../setores/setores.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Entity('encaminhamentos')
@Unique('UQ_encaminhamento_denuncia_setor', ['denunciaId', 'setorDestinoId'])
export class Encaminhamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  denunciaId: string;

  @ManyToOne(() => Denuncia, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'denunciaId' })
  denuncia?: Denuncia;

  @Column('varchar', { nullable: false })
  setorDestinoId: string;

  @ManyToOne(() => Setor, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'setorDestinoId' })
  setorDestino?: Setor;

  @Column('varchar', { nullable: false })
  enviadoPorId: string;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'enviadoPorId' })
  enviadoPor?: Usuario;

  @Column('varchar', { length: 500, nullable: true })
  observacao: string | null;

  @CreateDateColumn()
  dataEncaminhamento: Date;

  @Column('datetime', { nullable: true })
  aceite: Date | null;
}
