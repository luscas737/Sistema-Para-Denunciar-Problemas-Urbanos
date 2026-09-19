import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';
import { CreateDenunciaDto, UpdateDenunciaDto } from './dto/denuncia.dto';
export declare class DenunciasController {
    private readonly denunciasService;
    constructor(denunciasService: DenunciasService);
    criar(dto: CreateDenunciaDto): Promise<Denuncia>;
    listar(filtros: {
        categoria?: string;
        status?: string;
    }): Promise<Denuncia[]>;
    listarParaMapa(filtros: {
        categoria?: string;
        status?: string;
    }): Promise<Denuncia[]>;
    obterPorId(id: string): Promise<Denuncia>;
    atualizar(id: string, dto: UpdateDenunciaDto): Promise<Denuncia>;
    remover(id: string): Promise<void>;
}
