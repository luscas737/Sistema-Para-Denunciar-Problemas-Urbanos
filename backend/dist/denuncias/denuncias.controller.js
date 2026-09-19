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
exports.DenunciasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const denuncias_service_1 = require("./denuncias.service");
const denuncia_dto_1 = require("./dto/denuncia.dto");
let DenunciasController = class DenunciasController {
    constructor(denunciasService) {
        this.denunciasService = denunciasService;
    }
    criar(dto) {
        return this.denunciasService.criar(dto);
    }
    listar(filtros) {
        return this.denunciasService.listar(filtros);
    }
    listarParaMapa(filtros) {
        return this.denunciasService.listar(filtros);
    }
    obterPorId(id) {
        return this.denunciasService.obterPorId(id);
    }
    atualizar(id, dto) {
        return this.denunciasService.atualizar(id, dto);
    }
    remover(id) {
        return this.denunciasService.remover(id);
    }
};
exports.DenunciasController = DenunciasController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra uma denúncia' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [denuncia_dto_1.CreateDenunciaDto]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista denúncias, com filtros por categoria e status' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('mapa'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista denúncias para exibição no mapa' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "listarParaMapa", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca uma denúncia pelo id' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza uma denúncia' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, denuncia_dto_1.UpdateDenunciaDto]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove uma denúncia' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DenunciasController.prototype, "remover", null);
exports.DenunciasController = DenunciasController = __decorate([
    (0, swagger_1.ApiTags)('denuncias'),
    (0, common_1.Controller)('denuncias'),
    __metadata("design:paramtypes", [denuncias_service_1.DenunciasService])
], DenunciasController);
//# sourceMappingURL=denuncias.controller.js.map