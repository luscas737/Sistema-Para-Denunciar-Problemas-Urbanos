import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('anexos')
export class Anexo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  denunciaId: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: ['imagem', 'documento'],
  })
  tipo: 'imagem' | 'documento';

  @Column({ nullable: true })
  descricao: string;

  @Column({ nullable: true })
  enviadoPorId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criadoEm: Date;
}