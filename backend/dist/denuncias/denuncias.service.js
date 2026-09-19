"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenunciasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const denuncia_entity_1 = require("./entities/denuncia.entity");
const denuncia_enums_1 = require("./denuncia.enums");
let DenunciasService = class DenunciasService {
    constructor(denunciasRepository) {
        this.denunciasRepository = denunciasRepository;
    }
    async criar(dto) {
        const denuncia = this.denunciasRepository.create({
            ...dto,
            status: denuncia_enums_1.StatusDenuncia.RECEBIDA,
        });
        return this.denunciasRepository.save(denuncia);
    }
    async listar(filtros) {
        const where = {};
        if (filtros.categoria)
            where.categoria = filtros.categoria;
        if (filtros.status)
            where.status = filtros.status;
        return this.denunciasRepository.find({
            where,
            order: { criadoEm: 'DESC' },
        });
    }
    async obterPorId(id) {
        const denuncia = await this.denunciasRepository.findOneBy({ id });
        if (!denuncia) {
            throw new common_1.NotFoundException(`Denúncia com id ${id} não encontrada.`);
        }
        return denuncia;
    }
    async atualizar(id, dto) {
        const denuncia = await this.obterPorId(id);
        const { status, ...resto } = dto;
        Object.assign(denuncia, resto);
        if (status)
            denuncia.status = status;
        return this.denunciasRepository.save(denuncia);
    }
    async remover(id) {
        const denuncia = await this.obterPorId(id);
        await this.denunciasRepository.remove(denuncia);
    }
};
exports.DenunciasService = DenunciasService;
exports.DenunciasService = DenunciasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(denuncia_entity_1.Denuncia)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DenunciasService);
//# sourceMappingURL=denuncias.service.js.map