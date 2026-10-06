import { ChildEntity, Column } from 'typeorm';
import { Usuario } from './usuario.entity';

@ChildEntity('administrador')
export class Administrador extends Usuario {
  @Column({ type: 'integer', default: 1 })
  nivelAcesso: number; // 1 = padrão, 2 = pode reabrir denúncia resolvida
}