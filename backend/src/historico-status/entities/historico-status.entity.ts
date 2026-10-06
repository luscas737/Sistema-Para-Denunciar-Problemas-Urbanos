import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historico_status')
export class HistoricoStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  denunciaId: string;

  @Column({ nullable: true })
  statusAnterior: string;

  @Column()
  statusAtual: string;

  @Column({ nullable: true })
  alteradoPorId: string;

  @Column({ nullable: true })
  comentario: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataAlteracao: Date;
}