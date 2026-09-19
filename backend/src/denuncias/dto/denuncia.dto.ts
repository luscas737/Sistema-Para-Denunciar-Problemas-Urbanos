import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CategoriaDenuncia, StatusDenuncia } from '../denuncia.enums';

export const categoriaEnum = z.nativeEnum(CategoriaDenuncia);
export const statusEnum = z.nativeEnum(StatusDenuncia);

export const createDenunciaSchema = z.object({
  titulo: z.string().min(5).max(100),
  descricao: z.string().min(10).max(1000),
  categoria: categoriaEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  foto: z.string().url().max(500).optional().nullable(),
});

export const updateDenunciaSchema = createDenunciaSchema.partial().extend({
  status: statusEnum.optional(),
});

export class CreateDenunciaDto extends createZodDto(createDenunciaSchema) {}
export class UpdateDenunciaDto extends createZodDto(updateDenunciaSchema) {}
