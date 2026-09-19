"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const denuncias_service_1 = require("./denuncias.service");
const denuncia_entity_1 = require("./entities/denuncia.entity");
const denuncia_enums_1 = require("./denuncia.enums");
const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
});
describe('DenunciasService', () => {
    let service;
    let repository;
    beforeEach(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            providers: [
                denuncias_service_1.DenunciasService,
                { provide: (0, typeorm_1.getRepositoryToken)(denuncia_entity_1.Denuncia), useFactory: mockRepository },
            ],
        }).compile();
        service = moduleRef.get(denuncias_service_1.DenunciasService);
        repository = moduleRef.get((0, typeorm_1.getRepositoryToken)(denuncia_entity_1.Denuncia));
    });
    it('cria uma denúncia com status inicial recebida', async () => {
        const dto = {
            titulo: 'Buraco na rua principal',
            descricao: 'Existe um buraco grande em frente ao numero 100.',
            categoria: denuncia_enums_1.CategoriaDenuncia.BURACO,
            latitude: -8.9,
            longitude: -36.6,
            foto: null,
        };
        repository.create.mockReturnValue(dto);
        repository.save.mockResolvedValue({ id: 'uuid-1', ...dto, status: denuncia_enums_1.StatusDenuncia.RECEBIDA });
        const resultado = await service.criar(dto);
        expect(resultado.status).toBe(denuncia_enums_1.StatusDenuncia.RECEBIDA);
        expect(repository.save).toHaveBeenCalled();
    });
    it('lanca NotFoundException quando denúncia nao existe', async () => {
        repository.findOneBy.mockResolvedValue(null);
        await expect(service.obterPorId('id-inexistente')).rejects.toThrow(common_1.NotFoundException);
    });
    it('atualiza o status de uma denúncia existente', async () => {
        const existente = {
            id: 'uuid-1',
            titulo: 'Poste queimado',
            status: denuncia_enums_1.StatusDenuncia.RECEBIDA,
        };
        repository.findOneBy.mockResolvedValue(existente);
        repository.save.mockImplementation(async (d) => d);
        const resultado = await service.atualizar('uuid-1', { status: denuncia_enums_1.StatusDenuncia.EM_ANDAMENTO });
        expect(resultado.status).toBe(denuncia_enums_1.StatusDenuncia.EM_ANDAMENTO);
    });
});
//# sourceMappingURL=denuncias.service.spec.js.map