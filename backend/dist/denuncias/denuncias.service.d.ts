import { Repository } from 'typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { CreateDenunciaDto, UpdateDenunciaDto } from './dto/denuncia.dto';
export declare class DenunciasService {
    private readonly denunciasRepository;
    constructor(denunciasRepository: Repository<Denuncia>);
    criar(dto: CreateDenunciaDto): Promise<Denuncia>;
    listar(filtros: {
        categoria?: string;
        status?: string;
    }): Promise<Denuncia[]>;
    obterPorId(id: string): Promise<Denuncia>;
    atualizar(id: string, dto: UpdateDenunciaDto): Promise<Denuncia>;
    remover(id: string): Promise<void>;
}
