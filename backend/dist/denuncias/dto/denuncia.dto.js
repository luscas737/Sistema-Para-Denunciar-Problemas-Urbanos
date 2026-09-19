"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDenunciaDto = exports.CreateDenunciaDto = exports.updateDenunciaSchema = exports.createDenunciaSchema = exports.statusEnum = exports.categoriaEnum = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const denuncia_enums_1 = require("../denuncia.enums");
exports.categoriaEnum = zod_1.z.nativeEnum(denuncia_enums_1.CategoriaDenuncia);
exports.statusEnum = zod_1.z.nativeEnum(denuncia_enums_1.StatusDenuncia);
exports.createDenunciaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(5).max(100),
    descricao: zod_1.z.string().min(10).max(1000),
    categoria: exports.categoriaEnum,
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    foto: zod_1.z.string().url().max(500).optional().nullable(),
});
exports.updateDenunciaSchema = exports.createDenunciaSchema.partial().extend({
    status: exports.statusEnum.optional(),
});
class CreateDenunciaDto extends (0, nestjs_zod_1.createZodDto)(exports.createDenunciaSchema) {
}
exports.CreateDenunciaDto = CreateDenunciaDto;
class UpdateDenunciaDto extends (0, nestjs_zod_1.createZodDto)(exports.updateDenunciaSchema) {
}
exports.UpdateDenunciaDto = UpdateDenunciaDto;
//# sourceMappingURL=denuncia.dto.js.map