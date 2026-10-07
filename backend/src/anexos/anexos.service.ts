import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { CriarAnexoDto } from './dto/anexo.dto';
import { Anexo } from './entities/anexo.entity';

/** Regra de service da seção 5.4 (10): máximo de 5 anexos por denúncia. */
export const LIMITE_ANEXOS_POR_DENUNCIA = 5;

@Injectable()
export class AnexosService {
  constructor(
    @InjectRepository(Anexo)
    private readonly anexos: Repository<Anexo>,
    @InjectRepository(Denuncia)
    private readonly denuncias: Repository<Denuncia>,
  ) {}

  async criar(denunciaId: string, dto: CriarAnexoDto, enviadoPorId: string | null): Promise<Anexo> {
    await this.garantirDenunciaEditavel(denunciaId);

    const total = await this.anexos.count({ where: { denunciaId } });
    if (total >= LIMITE_ANEXOS_POR_DENUNCIA) {
      throw new ConflictException(
        `Esta denúncia já atingiu o limite de ${LIMITE_ANEXOS_POR_DENUNCIA} anexos.`,
      );
    }

    const anexo = this.anexos.create({
      denunciaId,
      url: dto.url.trim(),
      tipo: dto.tipo,
      descricao: dto.descricao?.trim() || null,
      enviadoPorId: enviadoPorId || null,
    });
    return this.anexos.save(anexo);
  }

  async listarPorDenuncia(denunciaId: string): Promise<Anexo[]> {
    await this.garantirDenuncia(denunciaId);
    return this.anexos.find({ where: { denunciaId }, order: { criadoEm: 'ASC' } });
  }

  async remover(denunciaId: string, anexoId: string): Promise<Anexo> {
    await this.garantirDenuncia(denunciaId);
    // Busca já escopada na denúncia: anexo de outra denúncia responde 404.
    const anexo = await this.anexos.findOneBy({ id: anexoId, denunciaId });
    if (!anexo) {
      throw new NotFoundException(`Anexo com id ${anexoId} não encontrado.`);
    }
    await this.anexos.remove(anexo);
    return anexo;
  }

  private async garantirDenuncia(denunciaId: string): Promise<Denuncia> {
    const denuncia = await this.denuncias.findOneBy({ id: denunciaId });
    if (!denuncia) {
      throw new NotFoundException(`Denúncia com id ${denunciaId} não encontrada.`);
    }
    return denuncia;
  }

  /** Regra 4 da seção 6.3: anexo só em denúncia não arquivada. */
  private async garantirDenunciaEditavel(denunciaId: string): Promise<Denuncia> {
    const denuncia = await this.garantirDenuncia(denunciaId);
    if (denuncia.arquivada) {
      throw new ConflictException('Denúncia arquivada não pode receber anexos.');
    }
    return denuncia;
  }
}