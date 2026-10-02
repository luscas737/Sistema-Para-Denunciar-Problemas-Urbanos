import { ChildEntity, Column } from 'typeorm';
import { Usuario } from './usuario.entity';

/** Cidadão: quem registra as denúncias (subtipo de `Usuario`, decisão D1). */
@ChildEntity('cidadao')
export class Cidadao extends Usuario {
  @Column('varchar', { length: 14, nullable: true })
  cpf: string | null;

  @Column('varchar', { length: 80, nullable: true })
  bairro: string | null;
}
