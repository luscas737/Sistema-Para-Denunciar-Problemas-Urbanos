import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { CreateDenunciaDto, UpdateDenunciaDto, statusEnum } from './dto/denuncia.dto';
import { StatusDenuncia } from './denuncia.enums';
import { z } from 'zod';

@Injectable()
export class DenunciasService {
  constructor(
    @InjectRepository(Denuncia)
    private readonly denunciasRepository: Repository<Denuncia>,
  ) {}

  async criar(dto: CreateDenunciaDto): Promise<Denuncia> {
    const denuncia = this.denunciasRepository.create({
      ...dto,
      status: StatusDenuncia.RECEBIDA,
    });
    return this.denunciasRepository.save(denuncia);
  }

  async listar(filtros: { categoria?: string; status?: string }): Promise<Denuncia[]> {
    const where: FindOptionsWhere<Denuncia> = {};
    if (filtros.categoria) where.categoria = filtros.categoria as any;
    if (filtros.status) where.status = filtros.status as any;
    return this.denunciasRepository.find({
      where,
      order: { criadoEm: 'DESC' },
    });
  }

  async obterPorId(id: string): Promise<Denuncia> {
    const denuncia = await this.denunciasRepository.findOneBy({ id });
    if (!denuncia) {
      throw new NotFoundException(`Denúncia com id ${id} não encontrada.`);
    }
    return denuncia;
  }

  async atualizar(id: string, dto: UpdateDenunciaDto): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);
    const { status, ...resto } = dto;
    Object.assign(denuncia, resto);
    if (status) denuncia.status = status;
    return this.denunciasRepository.save(denuncia);
  }

  async remover(id: string): Promise<void> {
    const denuncia = await this.obterPorId(id);
    await this.denunciasRepository.remove(denuncia);
  }
}
