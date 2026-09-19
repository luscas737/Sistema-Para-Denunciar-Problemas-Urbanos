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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Denuncia = void 0;
const typeorm_1 = require("typeorm");
const denuncia_enums_1 = require("../denuncia.enums");
let Denuncia = class Denuncia {
};
exports.Denuncia = Denuncia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Denuncia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], Denuncia.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 1000 }),
    __metadata("design:type", String)
], Denuncia.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20 }),
    __metadata("design:type", String)
], Denuncia.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)('real'),
    __metadata("design:type", Number)
], Denuncia.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('real'),
    __metadata("design:type", Number)
], Denuncia.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 500, nullable: true }),
    __metadata("design:type", Object)
], Denuncia.prototype, "foto", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 20, default: denuncia_enums_1.StatusDenuncia.RECEBIDA }),
    __metadata("design:type", String)
], Denuncia.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Denuncia.prototype, "criadoEm", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Denuncia.prototype, "atualizadoEm", void 0);
exports.Denuncia = Denuncia = __decorate([
    (0, typeorm_1.Entity)('denuncias')
], Denuncia);
//# sourceMappingURL=denuncia.entity.js.map